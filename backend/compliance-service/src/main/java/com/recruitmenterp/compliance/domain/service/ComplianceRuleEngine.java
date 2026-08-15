package com.recruitmenterp.compliance.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import com.recruitmenterp.compliance.domain.model.ChecklistItem;
import com.recruitmenterp.compliance.domain.model.ChecklistItemStatus;
import com.recruitmenterp.compliance.domain.model.ComplianceChecklist;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import com.recruitmenterp.compliance.domain.service.evaluator.ValidationConstraintEvaluator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ComplianceRuleEngine {

    private static final Logger log = LoggerFactory.getLogger(ComplianceRuleEngine.class);

    private final Map<String, ValidationConstraintEvaluator> evaluators;
    private final ObjectMapper objectMapper;

    @Autowired
    public ComplianceRuleEngine(List<ValidationConstraintEvaluator> evaluatorList, ObjectMapper objectMapper) {
        this.evaluators = evaluatorList.stream()
                .collect(Collectors.toMap(ValidationConstraintEvaluator::getConstraintKey, Function.identity()));
        this.objectMapper = objectMapper;
    }

    public boolean evaluateRules(ComplianceRule rule, CandidateComplianceContext context) {
        String validationRules = rule.getValidationRules();
        if (validationRules == null || validationRules.trim().isEmpty()) {
            return true;
        }

        try {
            JsonNode rootNode = objectMapper.readTree(validationRules);
            if (!rootNode.isObject()) {
                return false;
            }

            Iterator<Map.Entry<String, JsonNode>> fields = rootNode.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                String key = field.getKey();
                JsonNode value = field.getValue();

                ValidationConstraintEvaluator evaluator = evaluators.get(key);
                if (evaluator != null) {
                    if (!evaluator.evaluate(value, context)) {
                        return false;
                    }
                }
            }
            return true;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse validation rules JSON", e);
            return false;
        }
    }

    public void verifyItem(ComplianceChecklist checklist, ChecklistItem itemToVerify) {
        if (itemToVerify.getStageRequiredBy() != null) {
            List<ChecklistItem> items = checklist.getItems();
            
            boolean previousStagesIncomplete = items.stream()
                .filter(i -> i.getStageRequiredBy() != null)
                .filter(i -> i.getStageRequiredBy() < itemToVerify.getStageRequiredBy())
                .anyMatch(i -> i.getStatus() != ChecklistItemStatus.VERIFIED);
                
            if (previousStagesIncomplete) {
                throw new IllegalStateException("Cannot verify item at stage " + itemToVerify.getStageRequiredBy() + 
                    " because previous stages are not completely verified");
            }
        }
        
        itemToVerify.setStatus(ChecklistItemStatus.VERIFIED);
    }
}
