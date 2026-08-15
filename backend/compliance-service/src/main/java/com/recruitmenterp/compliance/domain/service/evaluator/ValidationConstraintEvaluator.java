package com.recruitmenterp.compliance.domain.service.evaluator;

import com.fasterxml.jackson.databind.JsonNode;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;

public interface ValidationConstraintEvaluator {
    boolean evaluate(JsonNode constraintValue, CandidateComplianceContext context);
    String getConstraintKey();
}
