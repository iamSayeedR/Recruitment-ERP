package com.recruitmenterp.gateway.adapter.in.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.gateway.domain.DomainEvent;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DashboardAggregateConsumer {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public DashboardAggregateConsumer(StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = {"requisition-events", "candidate-events", "compliance-events"}, groupId = "gateway-dashboard-aggregator")
    public void consumeAndAggregate(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            String tenantId = root.path("tenantId").asText(null);
            if (tenantId == null || tenantId.isEmpty()) return;

            String entityType = root.path("entityType").asText("");
            String action = root.path("action").asText("");
            String eventType = root.path("eventType").asText("");

            if ("REQUISITION".equals(entityType) || eventType.startsWith("Requisition")) {
                String status = root.path("payload").path("status").asText(action.isEmpty() ? "UNKNOWN" : action);
                updateCount(tenantId, "requisitions", status);
            } else if ("CANDIDATE".equals(entityType) || eventType.startsWith("Candidate")) {
                String stage = root.path("payload").path("stage").asText(action.isEmpty() ? "UNKNOWN" : action);
                updateCount(tenantId, "candidates", stage);
            } else if ("COMPLIANCE".equals(entityType) || eventType.startsWith("Checklist")) {
                String status = root.path("payload").path("status").asText(action.isEmpty() ? "UNKNOWN" : action);
                updateCount(tenantId, "compliance", status);
            }

            // Record live activity event into Redis ZSet for activity feed
            long score = System.currentTimeMillis();
            String entityName = root.path("payload").path("title").asText(
                root.path("payload").path("fullName").asText(
                    root.path("payload").path("name").asText(entityType)
                )
            );
            String actor = root.path("actor").asText(root.path("createdBy").asText("system"));

            Map<String, Object> activityEvent = Map.of(
                "id", root.path("eventId").asText("evt-" + score),
                "type", eventType.isEmpty() ? action : eventType,
                "entity", entityName,
                "actor", actor,
                "timestamp", java.time.Instant.ofEpochMilli(score).toString()
            );

            redisTemplate.opsForZSet().add("dashboard:" + tenantId + ":activity", objectMapper.writeValueAsString(activityEvent), score);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void updateCount(String tenantId, String domain, String status) throws JsonProcessingException {
        String key = "dashboard:" + tenantId + ":" + domain;
        String data = redisTemplate.opsForValue().get(key);
        Map<String, Integer> counts = new HashMap<>();
        if (data != null) {
            counts = objectMapper.readValue(data, objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Integer.class));
        }
        counts.put(status, counts.getOrDefault(status, 0) + 1);
        redisTemplate.opsForValue().set(key, objectMapper.writeValueAsString(counts));
    }
}
