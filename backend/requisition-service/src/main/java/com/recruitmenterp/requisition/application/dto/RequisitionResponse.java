package com.recruitmenterp.requisition.application.dto;

import com.recruitmenterp.requisition.domain.model.JobCategory;
import com.recruitmenterp.requisition.domain.model.RequisitionPriority;
import com.recruitmenterp.requisition.domain.model.RequisitionStatus;

import java.time.Instant;
import java.util.UUID;

public record RequisitionResponse(
        UUID id,
        String tenantId,
        UUID clientId,
        UUID branchId,
        String title,
        String description,
        JobCategory jobCategory,
        String destinationCountry,
        int positionsRequired,
        int positionsFilled,
        String salaryRange,
        String benefits,
        Integer contractDuration,
        String requiredSkills,
        String requiredCertifications,
        RequisitionStatus status,
        RequisitionPriority priority,
        String approvedBy,
        Instant approvalDate,
        Instant createdAt,
        Instant updatedAt,
        String createdBy,
        String updatedBy
) {
}
