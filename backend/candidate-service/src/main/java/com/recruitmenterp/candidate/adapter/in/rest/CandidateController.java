package com.recruitmenterp.candidate.adapter.in.rest;

import com.recruitmenterp.candidate.application.service.CandidateService;
import com.recruitmenterp.candidate.application.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN')")
    public Page<CandidateResponse> getCandidates(Pageable pageable) {
        return candidateService.getAllCandidates(pageable);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN')")
    public CandidateResponse createCandidate(@Valid @RequestBody CreateCandidateRequest request) {
        return candidateService.createCandidate(request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN')")
    public CandidateResponse getCandidate(@PathVariable UUID id) {
        return candidateService.getCandidateById(id);
    }

    @PostMapping({"/bulk", "/bulk-upload"})
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN', 'BRANCH_MANAGER')")
    public java.util.Map<String, Object> bulkUpload(@RequestBody BulkCandidateUploadRequest request) {
        int successCount = 0;
        if (request.candidates() != null && !request.candidates().isEmpty()) {
            for (CreateCandidateRequest req : request.candidates()) {
                if (req.firstName() != null && !req.firstName().isBlank() && req.lastName() != null && !req.lastName().isBlank()) {
                    try {
                        candidateService.createCandidate(req);
                        successCount++;
                    } catch (Exception e) {
                        // Skip row on database constraint error (e.g. duplicate email)
                    }
                }
            }
            return java.util.Map.of("message", "Candidates processed successfully", "uploadedCount", successCount);
        } else if (request.csvContent() != null) {
            candidateService.bulkUploadCandidates(request.csvContent());
            return java.util.Map.of("message", "Candidates uploaded successfully");
        }
        return java.util.Map.of("message", "No candidates provided", "uploadedCount", 0);
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN')")
    public void uploadDocument(@PathVariable UUID id, @RequestParam("file") MultipartFile file) throws IOException {
        candidateService.uploadDocument(id, file.getBytes(), file.getOriginalFilename());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public CandidateResponse updateCandidate(@PathVariable UUID id, @Valid @RequestBody CreateCandidateRequest request) {
        return candidateService.updateCandidate(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public void deleteCandidate(@PathVariable UUID id) {
        candidateService.deleteCandidate(id);
    }

    @GetMapping("/applications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN', 'BRANCH_MANAGER')")
    public java.util.List<com.recruitmenterp.candidate.domain.model.CandidateApplication> getAllApplications() {
        return candidateService.getAllApplications();
    }

    @GetMapping("/requisitions/{requisitionId}/applications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN', 'BRANCH_MANAGER')")
    public java.util.List<com.recruitmenterp.candidate.domain.model.CandidateApplication> getApplicationsForRequisition(@PathVariable UUID requisitionId) {
        return candidateService.getApplicationsByRequisitionId(requisitionId);
    }

    @PostMapping("/applications")
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN', 'BRANCH_MANAGER')")
    public com.recruitmenterp.candidate.domain.model.CandidateApplication createApplication(@RequestBody java.util.Map<String, String> body) {
        if (body == null || !body.containsKey("candidateId") || !body.containsKey("requisitionId")) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "candidateId and requisitionId are required"
            );
        }
        try {
            UUID candidateId = UUID.fromString(body.get("candidateId"));
            UUID requisitionId = UUID.fromString(body.get("requisitionId"));
            return candidateService.createApplication(candidateId, requisitionId);
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid UUID format: " + e.getMessage()
            );
        }
    }

    @PatchMapping("/applications/{applicationId}/status")
    @PreAuthorize("hasAnyRole('RECRUITER', 'COMPLIANCE_OFFICER', 'TENANT_ADMIN', 'BRANCH_MANAGER')")
    public void updateApplicationStatus(@PathVariable UUID applicationId, @RequestParam("status") com.recruitmenterp.candidate.domain.model.CandidateApplicationStatus status) {
        candidateService.transitionApplicationStatus(applicationId, status);
    }
}
