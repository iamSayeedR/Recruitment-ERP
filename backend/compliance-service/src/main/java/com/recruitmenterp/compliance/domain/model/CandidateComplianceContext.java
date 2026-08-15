package com.recruitmenterp.compliance.domain.model;

import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateComplianceContext {
    private UUID candidateApplicationId;
    private String tenantId;
    private String destinationCountry;
    private String sourceCountry;
    private String jobCategory;
    private LocalDate targetOnboardingDate;
    private LocalDate expiryAlertDate;
}
