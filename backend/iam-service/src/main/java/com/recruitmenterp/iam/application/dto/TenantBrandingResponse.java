package com.recruitmenterp.iam.application.dto;

public record TenantBrandingResponse(
        String name,
        String logoUrl,
        String primaryColor,
        String secondaryColor
) {}
