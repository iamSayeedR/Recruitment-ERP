package com.recruitmenterp.iam.application.dto;

public record CurrentUserResponse(
        UserProfileResponse user,
        TenantBrandingResponse tenantBranding
) {}
