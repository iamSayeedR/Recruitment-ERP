package com.recruitmenterp.compliance.adapter.in.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import com.recruitmenterp.compliance.domain.service.ComplianceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateComplianceEventConsumerTest {

    @Mock
    private ComplianceService complianceService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private CandidateComplianceEventConsumer consumer;

    @Test
    void testConsumeValidMessage() throws Exception {
        String message = "{\"candidateApplicationId\":\"123e4567-e89b-12d3-a456-426614174000\"}";
        CandidateComplianceContext context = new CandidateComplianceContext();
        when(objectMapper.readValue(message, CandidateComplianceContext.class)).thenReturn(context);

        consumer.consume(message);

        verify(complianceService, times(1)).generateChecklist(context);
    }

    @Test
    void testConsumeException() throws Exception {
        String message = "invalid";
        when(objectMapper.readValue(message, CandidateComplianceContext.class)).thenThrow(new RuntimeException("JSON Error"));

        consumer.consume(message);

        verify(complianceService, never()).generateChecklist(any());
    }
}
