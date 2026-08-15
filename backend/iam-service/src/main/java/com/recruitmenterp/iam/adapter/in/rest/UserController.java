package com.recruitmenterp.iam.adapter.in.rest;

import com.recruitmenterp.iam.application.dto.CreateUserRequest;
import com.recruitmenterp.iam.application.dto.UserProfileResponse;
import com.recruitmenterp.iam.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management API")
public class UserController {
    // Note: implementation truncated for brevity

    @PostMapping
    @PreAuthorize("@rbac.hasRole('TENANT_ADMIN')")
    @Operation(summary = "Create a new user")
    @ApiResponse(responseCode = "200", description = "User created")
    public UserProfileResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        // Implementation omitted
        return null;
    }
}
