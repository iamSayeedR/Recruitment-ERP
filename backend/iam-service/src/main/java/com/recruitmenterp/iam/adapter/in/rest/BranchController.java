package com.recruitmenterp.iam.adapter.in.rest;

import com.recruitmenterp.iam.application.dto.BranchResponse;
import com.recruitmenterp.iam.application.dto.CreateBranchRequest;
import com.recruitmenterp.iam.application.service.BranchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
@Tag(name = "Branches", description = "Branch management API")
public class BranchController {

    private final BranchService branchService;

    /**
     * List all branches for the current tenant.
     * Supports optional pagination via ?page and ?limit query params
     * (passed by useBranches.ts as ?page=1&limit=10).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'RECRUITER', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "List branches")
    @ApiResponse(responseCode = "200", description = "List of branches")
    public Object listBranches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int limit) {
        // useBranches.ts sends ?page=1&limit=10 (1-indexed). Convert to 0-indexed for Spring.
        int zeroPage = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(zeroPage, limit);
        return branchService.listBranches(pageable);
    }

    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    @Operation(summary = "Create a new branch")
    @ApiResponse(responseCode = "200", description = "Branch created")
    public BranchResponse createBranch(@Valid @RequestBody CreateBranchRequest request) {
        return branchService.createBranch(request);
    }
}
