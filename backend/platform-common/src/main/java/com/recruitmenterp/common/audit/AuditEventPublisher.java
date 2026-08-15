package com.recruitmenterp.common.audit;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AuditEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String AUDIT_TOPIC = "audit-events";

    public AuditEventPublisher(@Autowired(required = false) KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(AuditEvent event) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not available; skipping audit event for entity {}", event.entityId());
            return;
        }
        try {
            kafkaTemplate.send(AUDIT_TOPIC, event.tenantId(), event);
        } catch (Exception e) {
            log.error("Exception while publishing audit event: {}", e.getMessage(), e);
        }
    }
}
