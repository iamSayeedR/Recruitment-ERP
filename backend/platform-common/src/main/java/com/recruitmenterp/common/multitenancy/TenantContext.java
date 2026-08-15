package com.recruitmenterp.common.multitenancy;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;
import lombok.Getter;
import lombok.Setter;

/**
 * Request-scoped component that holds the current tenant context.
 * Resolved from JWT claims, never from user input.
 */
@Component
@RequestScope
@Getter
@Setter
public class TenantContext {
    private String tenantId;
    private String branchId;
    private String userId;

    public static String getCurrentTenantId() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            String claim = jwt.getClaimAsString("tenant_id");
            if (claim != null && !claim.isEmpty()) return claim;
        }
        return "tenant-acme";
    }

    /**
     * Clears the context.
     */
    public void clear() {
        this.tenantId = null;
        this.branchId = null;
        this.userId = null;
    }
}
