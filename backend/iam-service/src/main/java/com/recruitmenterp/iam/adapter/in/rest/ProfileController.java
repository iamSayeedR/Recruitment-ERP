package com.recruitmenterp.iam.adapter.in.rest;

import com.recruitmenterp.iam.application.dto.CurrentUserResponse;
import com.recruitmenterp.iam.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Current user profile API")
public class ProfileController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current user profile and tenant branding")
    @ApiResponse(responseCode = "200", description = "Profile retrieved")
    public CurrentUserResponse getCurrentUser() {
        return userService.getCurrentUser();
    }
}
