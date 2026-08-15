package com.recruitmenterp.requisition.application.dto;

import com.recruitmenterp.requisition.domain.model.RequisitionStatus;
import jakarta.validation.constraints.NotNull;

public record TransitionRequest(
        @NotNull RequisitionStatus newStatus,
        String notes
) {
}
