package com.recruitmenterp.iam.application.dto;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String tenantId,
        String keycloakUserId,
        String fullName,
        String email,
        String phone,
        String role,
        String status,
        UUID branchId
) {}
