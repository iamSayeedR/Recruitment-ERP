package com.recruitmenterp.common.multitenancy;

import com.recruitmenterp.common.security.JwtTenantClaimExtractor;
import com.recruitmenterp.common.security.TenantClaims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Filter that extracts tenant information from the JWT and sets it in the TenantContext
 * and Hibernate session.
 */
@Component
@RequiredArgsConstructor
public class TenantFilter extends OncePerRequestFilter {

    private final TenantContext tenantContext;
    private final JwtTenantClaimExtractor jwtTenantClaimExtractor;
    
    @Autowired(required = false)
    private EntityManager entityManager;
    
    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/actuator/health", "/actuator/ready", "/swagger-ui", "/v3/api-docs");

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean filterEnabled = false;

        try {
            if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
                TenantClaims claims = jwtTenantClaimExtractor.extract(jwt);
                
                if (claims.tenantId() != null) {
                    tenantContext.setTenantId(claims.tenantId());
                    tenantContext.setBranchId(claims.branchId());
                    tenantContext.setUserId(jwt.getSubject());
                    
                    // Enable Hibernate Filter for tenant isolation (if defined on entities)
                    if (entityManager != null) {
                        try {
                            Session session = entityManager.unwrap(Session.class);
                            session.enableFilter("tenantFilter").setParameter("tenantId", claims.tenantId());
                            filterEnabled = true;
                        } catch (Exception ignored) {}
                    }
                } else {
                    // Fail-closed security boundary: missing tenant claim on an authenticated request
                    throw new org.springframework.security.access.AccessDeniedException("Missing tenant isolation claim in JWT");
                }
            }

            filterChain.doFilter(request, response);
        } finally {
            tenantContext.clear();
            if (filterEnabled && entityManager != null) {
                try {
                    Session session = entityManager.unwrap(Session.class);
                    session.disableFilter("tenantFilter");
                } catch (Exception ignored) {}
            }
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }
}
