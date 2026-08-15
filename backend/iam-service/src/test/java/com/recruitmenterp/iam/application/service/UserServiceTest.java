package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.exception.EntityNotFoundException;
import com.recruitmenterp.common.multitenancy.TenantContext;
import com.recruitmenterp.iam.adapter.out.persistence.UserProfileRepository;
import com.recruitmenterp.iam.application.dto.CurrentUserResponse;
import com.recruitmenterp.iam.application.dto.TenantBrandingResponse;
import com.recruitmenterp.iam.application.dto.UserProfileResponse;
import com.recruitmenterp.iam.application.mapper.UserProfileMapper;
import com.recruitmenterp.iam.domain.model.UserProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private UserProfileMapper userProfileMapper;

    @Mock
    private TenantContext tenantContext;

    @Mock
    private TenantService tenantService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        // Use Mockito to mock the instance methods of TenantContext
    }

    @Test
    void getCurrentUser_Success_WithBranding() {
        // Arrange
        when(tenantContext.getTenantId()).thenReturn("TENANT1");
        when(tenantContext.getUserId()).thenReturn("user-123");
        
        UserProfile profile = new UserProfile();
        UserProfileResponse profileResponse = new UserProfileResponse(null, "TENANT1", "user-123", "John Doe", "john@example.com", null, null, null, null);
        TenantBrandingResponse branding = new TenantBrandingResponse("Corp", "logo", "color1", "color2");

        when(userProfileRepository.findByKeycloakUserId("user-123")).thenReturn(Optional.of(profile));
        when(userProfileMapper.toResponse(profile)).thenReturn(profileResponse);
        when(tenantService.getTenantBrandingByCode("TENANT1")).thenReturn(branding);

        // Act
        CurrentUserResponse response = userService.getCurrentUser();

        // Assert
        assertNotNull(response);
        assertEquals("user-123", response.user().keycloakUserId());
        assertEquals("Corp", response.tenantBranding().name());
    }

    @Test
    void getCurrentUser_Success_NoBranding() {
        // Arrange
        when(tenantContext.getTenantId()).thenReturn(null);
        when(tenantContext.getUserId()).thenReturn("user-123");

        UserProfile profile = new UserProfile();
        UserProfileResponse profileResponse = new UserProfileResponse(null, null, "user-123", "John Doe", "john@example.com", null, null, null, null);

        when(userProfileRepository.findByKeycloakUserId("user-123")).thenReturn(Optional.of(profile));
        when(userProfileMapper.toResponse(profile)).thenReturn(profileResponse);

        // Act
        CurrentUserResponse response = userService.getCurrentUser();

        // Assert
        assertNotNull(response);
        assertEquals("user-123", response.user().keycloakUserId());
        assertNull(response.tenantBranding());
    }

    @Test
    void getCurrentUser_NoUserId() {
        when(tenantContext.getUserId()).thenReturn(null);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> userService.getCurrentUser());
        assertEquals("No user ID found in context", exception.getMessage());
    }

    @Test
    void getCurrentUser_ProfileNotFound() {
        when(tenantContext.getUserId()).thenReturn("user-123");

        when(userProfileRepository.findByKeycloakUserId("user-123")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> userService.getCurrentUser());
    }
}
