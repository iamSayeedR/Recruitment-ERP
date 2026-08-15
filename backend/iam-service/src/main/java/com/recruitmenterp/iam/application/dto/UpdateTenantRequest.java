package com.recruitmenterp.iam.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record UpdateTenantRequest(
        @NotBlank @Schema(description = "Name of the tenant") String name,
        @Schema(description = "Logo URL") String logoUrl,
        @Schema(description = "Primary color") String primaryColor,
        @Schema(description = "Secondary color") String secondaryColor
) {}
