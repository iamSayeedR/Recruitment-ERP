package com.recruitmenterp.common.multitenancy;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Aspect that sets the PostgreSQL RLS session variable using SET LOCAL
 * strictly within an active @Transactional boundary.
 *
 * Scoping to SET LOCAL guarantees that when the transaction ends (commit or rollback),
 * PostgreSQL automatically discards the variable setting, ensuring zero leakage risk
 * across pooled JDBC connections.
 */
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;

@Aspect
@Component
@ConditionalOnBean(JdbcTemplate.class)
@Order(100)
@RequiredArgsConstructor
public class TenantRlsAspect {

    private final TenantContext tenantContext;
    private final JdbcTemplate jdbcTemplate;

    @Before("@annotation(org.springframework.transaction.annotation.Transactional) || @within(org.springframework.transaction.annotation.Transactional)")
    public void setRlsContext() {
        String tenantId = tenantContext.getTenantId();
        if (tenantId != null && !tenantId.isBlank() && TransactionSynchronizationManager.isActualTransactionActive()) {
            jdbcTemplate.execute(String.format("SET LOCAL app.current_tenant_id = '%s'", tenantId));
        }
    }
}
