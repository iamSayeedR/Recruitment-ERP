package com.recruitmenterp.common.multitenancy;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.persistence.EntityManager;
import org.springframework.jdbc.core.JdbcTemplate;
import com.recruitmenterp.common.security.JwtTenantClaimExtractor;
import com.recruitmenterp.common.security.TenantClaims;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import java.io.IOException;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.*;
import org.hibernate.Session;

class TenantFilterTest {

    private TenantFilter tenantFilter;
    private FilterChain filterChain;
    private EntityManager entityManager;
    private JdbcTemplate jdbcTemplate;
    private JwtTenantClaimExtractor extractor;
    private TenantContext tenantContext;

    @BeforeEach
    void setUp() {
        entityManager = mock(EntityManager.class);
        jdbcTemplate = mock(JdbcTemplate.class);
        extractor = mock(JwtTenantClaimExtractor.class);
        tenantContext = new TenantContext();
        tenantFilter = new TenantFilter(tenantContext, extractor);
        org.springframework.test.util.ReflectionTestUtils.setField(tenantFilter, "entityManager", entityManager);
        org.springframework.test.util.ReflectionTestUtils.setField(tenantFilter, "jdbcTemplate", jdbcTemplate);
        filterChain = mock(FilterChain.class);
        SecurityContextHolder.clearContext();
        Session session = mock(Session.class);
        org.hibernate.Filter hibernateFilter = mock(org.hibernate.Filter.class);
        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.enableFilter("tenantFilter")).thenReturn(hibernateFilter);
        when(hibernateFilter.setParameter(anyString(), any())).thenReturn(hibernateFilter);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        tenantContext.clear();
    }

    @Test
    void doFilterInternal_WithValidTenantId_SetsTenantContext() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").claim("dummy", "value").build();
        Authentication auth = new JwtAuthenticationToken(jwt);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        
        when(extractor.extract(any())).thenReturn(TenantClaims.builder().tenantId("tenant-123").roles(List.of()).build());

        doAnswer(invocation -> {
            assertEquals("tenant-123", tenantContext.getTenantId());
            return null;
        }).when(filterChain).doFilter(request, response);

        tenantFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(entityManager, atLeastOnce()).unwrap(Session.class);
        assertNull(tenantContext.getTenantId()); // Cleared after filter chain finishes
    }

    @Test
    void doFilterInternal_WithNoTenantId_ProceedsWithoutSettingTenant() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "none").claim("dummy", "value").build();
        Authentication auth = new JwtAuthenticationToken(jwt);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        
        when(extractor.extract(any())).thenReturn(TenantClaims.builder().roles(List.of()).build());

        tenantFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(tenantContext.getTenantId());
    }

    @Test
    void doFilterInternal_WithNoAuthentication_ProceedsNormally() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        tenantFilter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(tenantContext.getTenantId());
    }
}
