package com.recruitmenterp.gateway.adapter.in.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.gateway.domain.DomainEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class KafkaToDashboardBridge {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public KafkaToDashboardBridge(SimpMessagingTemplate messagingTemplate, ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = {"requisition-events", "candidate-events", "compliance-events"}, groupId = "gateway-dashboard-bridge")
    public void consumeAndBroadcast(String message) {
        try {
            DomainEvent<JsonNode> event = objectMapper.readValue(message, objectMapper.getTypeFactory().constructParametricType(DomainEvent.class, JsonNode.class));
            String tenantId = event.getTenantId();
            if (tenantId != null) {
                // Determine domain from topic name or event type. For simplicity here, we use a general approach
                // but the instructions say broadcast to /topic/tenant/{tenantId}/{domain}
                String domain = "general";
                if (message.contains("Requisition")) {
                    domain = "requisitions";
                } else if (message.contains("Candidate")) {
                    domain = "candidates";
                } else if (message.contains("Checklist")) {
                    domain = "compliance";
                }
                messagingTemplate.convertAndSend("/topic/tenant/" + tenantId + "/" + domain, event);
            }
        } catch (JsonProcessingException e) {
            // Log error
            e.printStackTrace();
        }
    }
}
