package com.recruitmenterp.common.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.Arrays;

@Component("rbac")
@RequiredArgsConstructor
public class RbacPreAuthorizationEvaluator {

    private final JwtTenantClaimExtractor extractor;

    private TenantClaims getCurrentClaims() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return extractor.extract(jwt);
        }
        return TenantClaims.builder().roles(List.of()).build();
    }

    public boolean isSuperAdmin() {
        return hasRole("SUPER_ADMIN");
    }

    public boolean isTenantAdmin() {
        return hasRole("TENANT_ADMIN");
    }

    public boolean canAccessBranch(String branchId) {
        if (isSuperAdmin() || isTenantAdmin()) return true;
        TenantClaims claims = getCurrentClaims();
        return branchId != null && branchId.equals(claims.branchId());
    }

    public boolean canAccessTenant(String tenantId) {
        if (isSuperAdmin()) return true;
        TenantClaims claims = getCurrentClaims();
        return tenantId != null && tenantId.equals(claims.tenantId());
    }

    public boolean hasRole(String role) {
        TenantClaims claims = getCurrentClaims();
        return claims.roles().contains(role);
    }

    public boolean hasAnyRole(String... roles) {
        TenantClaims claims = getCurrentClaims();
        return Arrays.stream(roles).anyMatch(role -> claims.roles().contains(role));
    }

    public boolean canManageUsers() {
        return isSuperAdmin() || isTenantAdmin();
    }
}
