package com.recruitmenterp.gateway.adapter.in.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Map;

import static org.mockito.Mockito.*;

class DashboardAggregateConsumerTest {

    @Test
    void shouldUpdateRedisWhenKafkaEventConsumed() throws Exception {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        @SuppressWarnings("unchecked")
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(anyString())).thenReturn(null);

        DashboardAggregateConsumer consumer = new DashboardAggregateConsumer(redisTemplate, objectMapper);

        String message1 = """
                {
                  "eventType": "RequisitionCreated",
                  "tenantId": "t1",
                  "payload": {
                    "status": "OPEN"
                  }
                }
                """;
        consumer.consumeAndAggregate(message1);
        verify(valueOps).set("dashboard:t1:requisitions", objectMapper.writeValueAsString(Map.of("OPEN", 1)));

        String message2 = """
                {
                  "eventType": "CandidateApplied",
                  "tenantId": "t1",
                  "payload": {
                    "stage": "APPLIED"
                  }
                }
                """;
        consumer.consumeAndAggregate(message2);
        verify(valueOps).set("dashboard:t1:candidates", objectMapper.writeValueAsString(Map.of("APPLIED", 1)));

        String message3 = """
                {
                  "eventType": "ChecklistCreated",
                  "tenantId": "t1",
                  "payload": {
                    "status": "PENDING"
                  }
                }
                """;
        consumer.consumeAndAggregate(message3);
        verify(valueOps).set("dashboard:t1:compliance", objectMapper.writeValueAsString(Map.of("PENDING", 1)));
    }

    @Test
    void shouldHandleExceptionWhenMessageIsInvalid() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ObjectMapper objectMapper = new ObjectMapper();
        
        DashboardAggregateConsumer consumer = new DashboardAggregateConsumer(redisTemplate, objectMapper);
        consumer.consumeAndAggregate("invalid-json");
        
        verifyNoInteractions(redisTemplate);
    }
}
