package com.recruitmenterp.gateway.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.gateway.domain.DashboardSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class DashboardControllerTest {

    @Test
    void shouldReturnDashboardSummaryForTenantAdmin() throws Exception {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("dashboard:t1:requisitions")).thenReturn("{\"OPEN\": 5}");
        when(valueOps.get("dashboard:t1:candidates")).thenReturn("{\"APPLIED\": 10}");
        when(valueOps.get("dashboard:t1:compliance")).thenReturn("{\"PENDING\": 2}");

        DashboardController controller = new DashboardController(redisTemplate, objectMapper);

        Jwt jwt = mock(Jwt.class);
        TestingAuthenticationToken auth = new TestingAuthenticationToken(jwt, null, List.of(new SimpleGrantedAuthority("ROLE_TENANT_ADMIN")));

        DashboardSummaryDto result = controller.getSummary("t1", auth);

        assertEquals(5, result.getRequisitions().get("OPEN"));
        assertEquals(10, result.getCandidates().get("APPLIED"));
        assertEquals(2, result.getCompliance().get("PENDING"));
    }

    @Test
    void shouldReturnDashboardSummaryForBranchManager() throws Exception {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get("dashboard:t2:requisitions")).thenReturn(null);
        when(valueOps.get("dashboard:t2:candidates")).thenReturn(null);
        when(valueOps.get("dashboard:t2:compliance")).thenReturn(null);

        DashboardController controller = new DashboardController(redisTemplate, objectMapper);

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaimAsString("branchId")).thenReturn("b1");
        TestingAuthenticationToken auth = new TestingAuthenticationToken(jwt, null, List.of(new SimpleGrantedAuthority("ROLE_BRANCH_MANAGER")));

        DashboardSummaryDto result = controller.getSummary("t2", auth);

        assertEquals(0, result.getRequisitions().size());
        assertEquals(0, result.getCandidates().size());
        assertEquals(0, result.getCompliance().size());
    }
}
