package com.recruitmenterp.iam.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record CreateClientRequest(
        @NotBlank @Schema(description = "Name of the client") String name,
        String industry,
        String country,
        String contactPerson,
        String contactEmail,
        String contactPhone,
        String notes
) {}
