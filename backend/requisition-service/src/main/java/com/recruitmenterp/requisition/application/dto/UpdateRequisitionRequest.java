package com.recruitmenterp.requisition.application.dto;

import com.recruitmenterp.requisition.domain.model.JobCategory;
import com.recruitmenterp.requisition.domain.model.RequisitionPriority;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateRequisitionRequest(
        UUID clientId,
        UUID branchId,
        @NotBlank @Size(max = 100) String title,
        String description,
        JobCategory jobCategory,
        String destinationCountry,
        @Min(1) Integer positionsRequired,
        String salaryRange,
        String benefits,
        Integer contractDuration,
        String requiredSkills,
        String requiredCertifications,
        RequisitionPriority priority
) {
}
