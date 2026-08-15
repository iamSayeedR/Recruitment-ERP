package com.recruitmenterp.iam.application.dto;

import com.recruitmenterp.iam.domain.model.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateUserRequest(
        @NotBlank @Schema(description = "Keycloak User ID") String keycloakUserId,
        @NotBlank @Schema(description = "Full name of the user") String fullName,
        @NotBlank @Email @Schema(description = "Email address") String email,
        String phone,
        @NotNull @Schema(description = "Role in the system") UserRole role,
        @Schema(description = "Branch ID, if applicable") UUID branchId
) {}
