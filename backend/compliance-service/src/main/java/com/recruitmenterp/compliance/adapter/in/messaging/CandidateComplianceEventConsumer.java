package com.recruitmenterp.compliance.adapter.in.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import com.recruitmenterp.compliance.domain.service.ComplianceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CandidateComplianceEventConsumer {

    private final ComplianceService complianceService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "candidate.application.compliance_stage_reached", groupId = "compliance-service-group")
    public void consume(String message) {
        try {
            CandidateComplianceContext context = objectMapper.readValue(message, CandidateComplianceContext.class);
            complianceService.generateChecklist(context);
        } catch (Exception e) {
            log.error("Failed to process candidate compliance event: {}", message, e);
        }
    }
}
