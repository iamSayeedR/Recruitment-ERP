package com.recruitmenterp.common.security;

import java.util.List;
import java.util.Map;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Utility class to extract tenant and role claims from a JWT token.
 * Strictly fails closed: no fallback tenant or default roles are granted.
 */
@Component
public class JwtTenantClaimExtractor {

    private static final String TENANT_ID_CLAIM = "tenant_id";
    private static final String BRANCH_ID_CLAIM = "branch_id";
    private static final String REALM_ACCESS_CLAIM = "realm_access";
    private static final String ROLES_CLAIM = "roles";

    /**
     * Extracts claims from a given JWT.
     *
     * @param jwt the JWT
     * @return the extracted tenant claims
     */
    public TenantClaims extract(Jwt jwt) {
        if (jwt == null) {
            return TenantClaims.builder().roles(List.of()).build();
        }

        String tenantId = jwt.getClaimAsString("tenant_id");
        if (tenantId == null) {
            tenantId = jwt.getClaimAsString("tenantId");
        }
        if (tenantId == null) {
            tenantId = jwt.getClaimAsString("tenant");
        }
        // Fail closed: No fallback tenantId assignment. If tenant_id is missing, tenantId remains null.
        
        String branchId = jwt.getClaimAsString("branch_id");
        if (branchId == null) {
            branchId = jwt.getClaimAsString("branchId");
        }
        
        List<String> roles = List.of();
        if (jwt.hasClaim("roles")) {
            roles = jwt.getClaimAsStringList("roles");
        } else if (jwt.hasClaim(REALM_ACCESS_CLAIM)) {
            Map<String, Object> realmAccess = jwt.getClaimAsMap(REALM_ACCESS_CLAIM);
            if (realmAccess != null && realmAccess.containsKey(ROLES_CLAIM)) {
                @SuppressWarnings("unchecked")
                List<String> extractedRoles = (List<String>) realmAccess.get(ROLES_CLAIM);
                roles = extractedRoles != null ? extractedRoles : List.of();
            }
        }
        // Fail closed: No default role assignment. If token lacks domain roles, roles list is not modified.

        return TenantClaims.builder()
                .tenantId(tenantId)
                .branchId(branchId)
                .roles(roles)
                .build();
    }
}
