package com.recruitmenterp.compliance.adapter.out.persistence;

import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import org.springframework.data.jpa.domain.Specification;

public class ComplianceRuleSpecification {
    public static Specification<ComplianceRule> matchesContext(CandidateComplianceContext context) {
        return (root, query, cb) -> {
            if (context == null) {
                return cb.conjunction();
            }
            return cb.and(
                cb.equal(root.get("tenantId"), context.getTenantId()),
                cb.equal(root.get("active"), true)
            );
        };
    }
}
