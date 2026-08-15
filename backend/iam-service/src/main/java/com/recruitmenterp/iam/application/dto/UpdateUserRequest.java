package com.recruitmenterp.iam.application.dto;

import com.recruitmenterp.iam.domain.model.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;

import java.util.UUID;

public record UpdateUserRequest(
        @Schema(description = "Full name of the user") String fullName,
        @Email @Schema(description = "Email address") String email,
        String phone,
        @Schema(description = "Role in the system") UserRole role,
        @Schema(description = "Branch ID, if applicable") UUID branchId
) {}
