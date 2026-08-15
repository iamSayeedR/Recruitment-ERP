package com.recruitmenterp.gateway.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.gateway.domain.DashboardSummaryDto;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public DashboardController(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'BRANCH_MANAGER', 'RECRUITER')")
    public DashboardSummaryDto getSummary(@RequestParam(required = false) String tenantId, Authentication authentication) throws Exception {
        String effectiveTenantId = extractTenantId(authentication, tenantId);

        DashboardSummaryDto summary = new DashboardSummaryDto();
        summary.setRequisitions(getMapFromRedis("dashboard:" + effectiveTenantId + ":requisitions"));
        summary.setCandidates(getMapFromRedis("dashboard:" + effectiveTenantId + ":candidates"));
        summary.setCompliance(getMapFromRedis("dashboard:" + effectiveTenantId + ":compliance"));
        return summary;
    }

    @GetMapping("/activity")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'BRANCH_MANAGER', 'RECRUITER')")
    public List<Map<String, Object>> getActivity(Authentication authentication) {
        String tenantId = extractTenantId(authentication, null);

        // Fetch recent activity events from Redis sorted set
        String key = "dashboard:" + tenantId + ":activity";
        Set<String> raw = null;
        try {
            raw = redisTemplate.opsForZSet().reverseRange(key, 0, 19);
        } catch (Exception ignored) {}

        List<Map<String, Object>> events = new ArrayList<>();
        if (raw != null) {
            for (String entry : raw) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> event = objectMapper.readValue(entry, Map.class);
                    events.add(event);
                } catch (Exception ignored) {
                    // Skip malformed entries
                }
            }
        }

        return events;
    }

    private String extractTenantId(Authentication authentication, String paramTenantId) {
        if (paramTenantId != null && !paramTenantId.isBlank()) return paramTenantId;
        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            String tid = jwt.getClaimAsString("tenantId");
            if (tid != null && !tid.isBlank()) return tid;
        }
        return "tenant-acme";
    }

    private Map<String, Integer> getMapFromRedis(String key) {
        try {
            String data = redisTemplate.opsForValue().get(key);
            if (data != null) {
                return objectMapper.readValue(data, objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Integer.class));
            }
        } catch (Exception ignored) {}
        return Map.of();
    }
}
