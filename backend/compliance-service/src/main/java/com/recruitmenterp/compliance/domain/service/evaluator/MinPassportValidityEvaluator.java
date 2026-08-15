package com.recruitmenterp.compliance.domain.service.evaluator;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class MinPassportValidityEvaluator implements ValidationConstraintEvaluator {

    @Override
    public boolean evaluate(JsonNode constraintValue, CandidateComplianceContext context) {
        if (!constraintValue.isNumber()) {
            return false;
        }
        
        int minMonths = constraintValue.asInt();
        
        LocalDate alertDate = context.getExpiryAlertDate();
        LocalDate targetDate = context.getTargetOnboardingDate();
        
        if (alertDate == null || targetDate == null) {
            return false;
        }
        
        LocalDate requiredValidityDate = targetDate.plusMonths(minMonths);
        return !alertDate.isBefore(requiredValidityDate);
    }

    @Override
    public String getConstraintKey() {
        return "min_passport_validity_months";
    }
}
