package com.recruitmenterp.iam.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record UpdateClientRequest(
        @Schema(description = "Name of the client") String name,
        String industry,
        String country,
        String contactPerson,
        String contactEmail,
        String contactPhone,
        String notes
) {}
