package com.recruitmenterp.compliance.domain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import com.recruitmenterp.compliance.domain.service.evaluator.MinPassportValidityEvaluator;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ComplianceRuleEngineTest {

    private final ObjectMapper mapper = new ObjectMapper();
    private final MinPassportValidityEvaluator passportEvaluator = new MinPassportValidityEvaluator();
    private final ComplianceRuleEngine engine = new ComplianceRuleEngine(List.of(passportEvaluator), mapper);

    @Test
    void testValidPassport() {
        ComplianceRule rule = ComplianceRule.builder()
                .validationRules("{\"min_passport_validity_months\": 6}")
                .build();
        
        CandidateComplianceContext context = CandidateComplianceContext.builder()
                .targetOnboardingDate(LocalDate.now())
                .expiryAlertDate(LocalDate.now().plusMonths(7))
                .build();
        
        assertTrue(engine.evaluateRules(rule, context));
    }

    @Test
    void testInvalidPassport() {
        ComplianceRule rule = ComplianceRule.builder()
                .validationRules("{\"min_passport_validity_months\": 6}")
                .build();
        
        CandidateComplianceContext context = CandidateComplianceContext.builder()
                .targetOnboardingDate(LocalDate.now())
                .expiryAlertDate(LocalDate.now().plusMonths(5))
                .build();
        
        assertFalse(engine.evaluateRules(rule, context));
    }

    @Test
    void testMalformedJson() {
        ComplianceRule rule = ComplianceRule.builder()
                .validationRules("{malformed}")
                .build();
        
        assertFalse(engine.evaluateRules(rule, new CandidateComplianceContext()));
    }

    @Test
    void testEmptyJson() {
        ComplianceRule rule = ComplianceRule.builder()
                .validationRules(null)
                .build();
        
        assertTrue(engine.evaluateRules(rule, new CandidateComplianceContext()));
    }
}
