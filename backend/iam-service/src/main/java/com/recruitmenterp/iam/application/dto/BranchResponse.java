package com.recruitmenterp.iam.application.dto;

import java.util.UUID;

public record BranchResponse(
        UUID id,
        String tenantId,
        String name,
        String code,
        String country,
        String city,
        String status
) {}
