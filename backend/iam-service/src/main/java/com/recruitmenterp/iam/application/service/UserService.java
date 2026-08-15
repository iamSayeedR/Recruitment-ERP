package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.exception.EntityNotFoundException;
import com.recruitmenterp.common.multitenancy.TenantContext;
import com.recruitmenterp.iam.adapter.out.persistence.UserProfileRepository;
import com.recruitmenterp.iam.application.dto.CurrentUserResponse;
import com.recruitmenterp.iam.application.dto.TenantBrandingResponse;
import com.recruitmenterp.iam.application.dto.UserProfileResponse;
import com.recruitmenterp.iam.application.mapper.UserProfileMapper;
import com.recruitmenterp.iam.domain.model.UserProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserProfileRepository userProfileRepository;
    private final UserProfileMapper userProfileMapper;
    private final TenantContext tenantContext;
    private final TenantService tenantService;

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser() {
        String keycloakUserId = tenantContext.getUserId();
        if (keycloakUserId == null) {
            throw new IllegalStateException("No user ID found in context");
        }

        UserProfile userProfile = userProfileRepository.findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException("User profile not found"));

        // Using tenant branding service
        TenantBrandingResponse branding = null;
        if (tenantContext.getTenantId() != null && !tenantContext.getTenantId().isEmpty()) {
            branding = tenantService.getTenantBrandingByCode(tenantContext.getTenantId());
        }

        return new CurrentUserResponse(userProfileMapper.toResponse(userProfile), branding);
    }
}
