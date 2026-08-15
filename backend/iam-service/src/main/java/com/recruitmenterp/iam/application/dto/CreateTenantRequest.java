package com.recruitmenterp.iam.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record CreateTenantRequest(
        @NotBlank @Schema(description = "Name of the tenant") String name,
        @NotBlank @Schema(description = "Unique code for the tenant") String code,
        @NotBlank @Schema(description = "Unique subdomain") String subdomain,
        @Schema(description = "Subscription plan") String subscriptionPlan
) {}
