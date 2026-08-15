package com.recruitmenterp.iam.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record CreateBranchRequest(
        @NotBlank @Schema(description = "Name of the branch") String name,
        @NotBlank @Schema(description = "Branch code") String code,
        String country,
        String city,
        String address,
        String phone,
        String email
) {}
