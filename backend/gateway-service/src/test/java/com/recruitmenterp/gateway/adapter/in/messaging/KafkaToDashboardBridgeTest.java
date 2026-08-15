package com.recruitmenterp.gateway.adapter.in.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.gateway.domain.DomainEvent;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class KafkaToDashboardBridgeTest {

    @Test
    void shouldBroadcastRequisitionEvent() throws Exception {
        SimpMessagingTemplate template = mock(SimpMessagingTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        KafkaToDashboardBridge bridge = new KafkaToDashboardBridge(template, objectMapper);

        String message = """
                {
                  "eventType": "RequisitionCreated",
                  "tenantId": "t1",
                  "payload": {
                    "status": "OPEN"
                  }
                }
                """;

        bridge.consumeAndBroadcast(message);

        verify(template).convertAndSend(eq("/topic/tenant/t1/requisitions"), any(DomainEvent.class));
    }
    
    @Test
    void shouldBroadcastCandidateEvent() throws Exception {
        SimpMessagingTemplate template = mock(SimpMessagingTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        KafkaToDashboardBridge bridge = new KafkaToDashboardBridge(template, objectMapper);

        String message = """
                {
                  "eventType": "CandidateApplied",
                  "tenantId": "t1",
                  "payload": {
                    "stage": "APPLIED"
                  }
                }
                """;

        bridge.consumeAndBroadcast(message);

        verify(template).convertAndSend(eq("/topic/tenant/t1/candidates"), any(DomainEvent.class));
    }

    @Test
    void shouldBroadcastComplianceEvent() throws Exception {
        SimpMessagingTemplate template = mock(SimpMessagingTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        KafkaToDashboardBridge bridge = new KafkaToDashboardBridge(template, objectMapper);

        String message = """
                {
                  "eventType": "ChecklistCreated",
                  "tenantId": "t1",
                  "payload": {
                    "status": "PENDING"
                  }
                }
                """;

        bridge.consumeAndBroadcast(message);

        verify(template).convertAndSend(eq("/topic/tenant/t1/compliance"), any(DomainEvent.class));
    }

    @Test
    void shouldHandleExceptionWhenMessageIsInvalid() {
        SimpMessagingTemplate template = mock(SimpMessagingTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        KafkaToDashboardBridge bridge = new KafkaToDashboardBridge(template, objectMapper);
        bridge.consumeAndBroadcast("invalid-json");
        
        verifyNoInteractions(template);
    }
}
