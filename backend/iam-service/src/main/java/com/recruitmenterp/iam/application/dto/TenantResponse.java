package com.recruitmenterp.iam.application.dto;

import java.util.UUID;

public record TenantResponse(
        UUID id,
        String name,
        String code,
        String subdomain,
        String status,
        String logoUrl,
        String subscriptionPlan
) {}
