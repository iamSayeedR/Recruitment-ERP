package com.recruitmenterp.common.security;

import java.util.List;
import lombok.Builder;

/**
 * Represents tenant-related claims extracted from a JWT token.
 *
 * @param tenantId the tenant ID
 * @param branchId the branch ID
 * @param roles the roles assigned to the user
 */
@Builder
public record TenantClaims(String tenantId, String branchId, List<String> roles) {}
