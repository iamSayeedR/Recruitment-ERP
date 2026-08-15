package com.recruitmenterp.common.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
public class DomainEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public DomainEventPublisher(@Autowired(required = false) KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String topic, String eventType, String tenantId, Object payload) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not available; skipping domain event {}", eventType);
            return;
        }
        try {
            DomainEvent<Object> event = DomainEvent.builder()
                    .eventType(eventType)
                    .tenantId(tenantId)
                    .timestamp(Instant.now())
                    .version("1.0")
                    .payload(payload)
                    .build();
            kafkaTemplate.send(topic, tenantId, event);
            log.info("Published domain event {} to topic {}", eventType, topic);
        } catch (Exception e) {
            log.error("Exception while publishing domain event {}: {}", eventType, e.getMessage(), e);
        }
    }
}
