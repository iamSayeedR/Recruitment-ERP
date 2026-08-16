package com.recruitmenterp.requisition.adapter.in.rest;

import com.recruitmenterp.requisition.application.dto.CreateRequisitionRequest;
import com.recruitmenterp.requisition.application.dto.RequisitionResponse;
import com.recruitmenterp.requisition.application.dto.TransitionRequest;
import com.recruitmenterp.requisition.application.dto.UpdateRequisitionRequest;
import com.recruitmenterp.requisition.application.service.RequisitionService;
import com.recruitmenterp.requisition.domain.model.JobCategory;
import com.recruitmenterp.requisition.domain.model.RequisitionStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/requisitions")
@Tag(name = "Requisition API", description = "Endpoints for managing job requisitions")
public class RequisitionController {

    private final RequisitionService service;

    public RequisitionController(RequisitionService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'CLIENT_USER')")
    @Operation(summary = "Create a new requisition")
    public RequisitionResponse createRequisition(@Valid @RequestBody CreateRequisitionRequest request) {
        return service.createRequisition(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'CLIENT_USER', 'RECRUITER')")
    @Operation(summary = "Get a requisition by ID")
    public RequisitionResponse getRequisition(@PathVariable UUID id) {
        return service.getRequisitionById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'CLIENT_USER', 'RECRUITER')")
    @Operation(summary = "Update an existing requisition")
    public RequisitionResponse updateRequisition(@PathVariable UUID id, @Valid @RequestBody UpdateRequisitionRequest request) {
        return service.updateRequisition(id, request);
    }

    @PostMapping("/{id}/transition")
    @Operation(summary = "Transition requisition status")
    public RequisitionResponse transitionStatus(@PathVariable UUID id, 
                                                @Valid @RequestBody TransitionRequest request,
                                                @AuthenticationPrincipal Jwt jwt) {
        String actor = jwt != null ? jwt.getClaimAsString("preferred_username") : "SYSTEM";
        return service.transitionStatus(id, request.newStatus(), request.notes(), actor);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update requisition status via query parameters")
    public RequisitionResponse updateStatus(@PathVariable UUID id,
                                           @RequestParam RequisitionStatus status,
                                           @RequestParam(required = false, defaultValue = "") String notes,
                                           @AuthenticationPrincipal Jwt jwt) {
        String actor = jwt != null ? jwt.getClaimAsString("preferred_username") : "SYSTEM";
        return service.transitionStatus(id, status, notes, actor);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'CLIENT_USER', 'RECRUITER')")
    @Operation(summary = "Search requisitions")
    public Page<RequisitionResponse> searchRequisitions(
            @RequestParam(required = false) JobCategory category,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) RequisitionStatus status,
            Pageable pageable) {
        return service.searchRequisitions(category, country, status, pageable);
    }

    @GetMapping("/{id}/applications")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'CLIENT_USER', 'RECRUITER')")
    @Operation(summary = "Get candidate applications for a requisition")
    public java.util.List<Object> getRequisitionApplications(@PathVariable UUID id) {
        return java.util.List.of();
    }
}

