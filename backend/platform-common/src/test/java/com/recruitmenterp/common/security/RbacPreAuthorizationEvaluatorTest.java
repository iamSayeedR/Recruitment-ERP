package com.recruitmenterp.common.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RbacPreAuthorizationEvaluatorTest {

    private JwtTenantClaimExtractor extractor;
    private RbacPreAuthorizationEvaluator evaluator;

    @BeforeEach
    void setUp() {
        extractor = mock(JwtTenantClaimExtractor.class);
        evaluator = new RbacPreAuthorizationEvaluator(extractor);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void setupSecurityContext(TenantClaims claims) {
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").claim("dummy", "value").build();
        Authentication auth = new JwtAuthenticationToken(jwt);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        when(extractor.extract(jwt)).thenReturn(claims);
    }

    @Test
    void testHasRole_True() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("TENANT_ADMIN")).build());
        assertTrue(evaluator.hasRole("TENANT_ADMIN"));
    }

    @Test
    void testHasRole_False() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("CANDIDATE")).build());
        assertFalse(evaluator.hasRole("TENANT_ADMIN"));
    }

    @Test
    void testCanAccessBranch_True_ForOwnBranch() {
        setupSecurityContext(TenantClaims.builder().branchId("branch-123").roles(List.of("BRANCH_MANAGER")).build());
        assertTrue(evaluator.canAccessBranch("branch-123"));
    }

    @Test
    void testCanAccessBranch_False_ForOtherBranch() {
        setupSecurityContext(TenantClaims.builder().branchId("branch-123").roles(List.of("BRANCH_MANAGER")).build());
        assertFalse(evaluator.canAccessBranch("branch-999"));
    }

    @Test
    void testCanAccessBranch_True_ForAdmin() {
        setupSecurityContext(TenantClaims.builder().branchId("branch-123").roles(List.of("TENANT_ADMIN")).build());
        assertTrue(evaluator.canAccessBranch("branch-999"));
    }

    @Test
    void testIsSuperAdmin_True() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("SUPER_ADMIN")).build());
        assertTrue(evaluator.isSuperAdmin());
    }

    @Test
    void testIsSuperAdmin_False() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("USER")).build());
        assertFalse(evaluator.isSuperAdmin());
    }

    @Test
    void testIsTenantAdmin_True() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("TENANT_ADMIN")).build());
        assertTrue(evaluator.isTenantAdmin());
    }

    @Test
    void testCanAccessTenant_True_ForOwnTenant() {
        setupSecurityContext(TenantClaims.builder().tenantId("tenant-123").roles(List.of("TENANT_ADMIN")).build());
        assertTrue(evaluator.canAccessTenant("tenant-123"));
    }

    @Test
    void testCanAccessTenant_False_ForOtherTenant() {
        setupSecurityContext(TenantClaims.builder().tenantId("tenant-123").roles(List.of("USER")).build());
        assertFalse(evaluator.canAccessTenant("tenant-999"));
    }

    @Test
    void testCanAccessTenant_True_ForSuperAdmin() {
        setupSecurityContext(TenantClaims.builder().tenantId("tenant-123").roles(List.of("SUPER_ADMIN")).build());
        assertTrue(evaluator.canAccessTenant("tenant-999"));
    }

    @Test
    void testHasAnyRole_True() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("RECRUITER", "USER")).build());
        assertTrue(evaluator.hasAnyRole("ADMIN", "RECRUITER"));
    }

    @Test
    void testHasAnyRole_False() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("USER")).build());
        assertFalse(evaluator.hasAnyRole("ADMIN", "RECRUITER"));
    }

    @Test
    void testCanManageUsers_True_ForTenantAdmin() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("TENANT_ADMIN")).build());
        assertTrue(evaluator.canManageUsers());
    }

    @Test
    void testCanManageUsers_True_ForSuperAdmin() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("SUPER_ADMIN")).build());
        assertTrue(evaluator.canManageUsers());
    }

    @Test
    void testCanManageUsers_False_ForRegularUser() {
        setupSecurityContext(TenantClaims.builder().roles(List.of("USER")).build());
        assertFalse(evaluator.canManageUsers());
    }

    @Test
    void testNoAuthContext_ReturnsEmptyClaimsAndFalse() {
        SecurityContextHolder.clearContext();
        assertFalse(evaluator.isSuperAdmin());
        assertFalse(evaluator.canAccessBranch("branch"));
    }
}
