package com.recruitmenterp.iam.application.dto;

import java.util.UUID;

public record ClientResponse(
        UUID id,
        String tenantId,
        String name,
        String industry,
        String country,
        String contactPerson,
        String contactEmail,
        String contactPhone,
        String status,
        String notes
) {}
