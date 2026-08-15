package com.recruitmenterp.compliance;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceRuleRepository;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers
@Transactional
@ActiveProfiles("test")
class ComplianceRlsIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("recruitment_erp")
            .withUsername("app_user")
            .withPassword("app_password");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
    }

    @Autowired
    private ComplianceRuleRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void testCrossTenantRlsIsolation() {
        jdbcTemplate.execute("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_tester') THEN CREATE ROLE rls_tester; END IF; END $$;");
        jdbcTemplate.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rls_tester");
        jdbcTemplate.execute("SET LOCAL ROLE rls_tester");

        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-a'");
        
        ComplianceRule rule = ComplianceRule.builder()
            .tenantId("tenant-a")
            .documentType("Passport")
            .required(true)
            .active(true)
            .build();
        repository.saveAndFlush(rule);

        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-b'");
        List<ComplianceRule> tenantBData = repository.findAll();
        assertTrue(tenantBData.isEmpty(), "RLS should filter out Tenant A's data for Tenant B");

        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-a'");
        List<ComplianceRule> tenantAData = repository.findAll();
        assertEquals(1, tenantAData.size(), "Tenant A should see their own data");
    }
}
