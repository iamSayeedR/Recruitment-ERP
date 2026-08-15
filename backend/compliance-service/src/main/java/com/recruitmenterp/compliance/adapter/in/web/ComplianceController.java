package com.recruitmenterp.compliance.adapter.in.web;

import com.recruitmenterp.compliance.domain.model.ComplianceChecklist;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import com.recruitmenterp.compliance.domain.service.ComplianceService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/compliance")
@RequiredArgsConstructor
public class ComplianceController {

    private final ComplianceService complianceService;

    @Data
    public static class AddComplianceItemRequest {
        private String documentType;
        private String status;
    }

    @PostMapping("/rules")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'RECRUITER', 'BRANCH_MANAGER')")
    public ResponseEntity<ComplianceRule> createRule(@RequestBody ComplianceRule rule) {
        return ResponseEntity.ok(complianceService.createRule(rule));
    }

    @GetMapping("/rules")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'RECRUITER', 'BRANCH_MANAGER')")
    public ResponseEntity<List<ComplianceRule>> getAllRules() {
        return ResponseEntity.ok(complianceService.getAllRules());
    }

    @GetMapping("/checklists/candidate/{candidateApplicationId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'RECRUITER', 'BRANCH_MANAGER')")
    public ResponseEntity<ComplianceChecklist> getCandidateChecklist(@PathVariable UUID candidateApplicationId) {
        return ResponseEntity.ok(complianceService.getCandidateChecklist(candidateApplicationId));
    }

    @PostMapping("/checklists/candidate/{candidateApplicationId}/items")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'RECRUITER', 'BRANCH_MANAGER')")
    public ResponseEntity<ComplianceChecklist> addChecklistItem(
            @PathVariable UUID candidateApplicationId,
            @RequestBody AddComplianceItemRequest req) {
        return ResponseEntity.ok(complianceService.addItemToCandidateChecklist(candidateApplicationId, req.getDocumentType(), req.getStatus()));
    }

    @PutMapping("/checklists/{checklistId}/items/{itemId}/status")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'RECRUITER', 'BRANCH_MANAGER')")
    public ResponseEntity<ComplianceChecklist> updateChecklistItemStatus(
            @PathVariable UUID checklistId,
            @PathVariable UUID itemId,
            @RequestParam String status) {
        return ResponseEntity.ok(complianceService.updateItemStatus(checklistId, itemId, status));
    }

    @PostMapping("/checklists/{checklistId}/items/{itemId}/verify")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'RECRUITER', 'BRANCH_MANAGER')")
    public ResponseEntity<ComplianceChecklist> verifyChecklistItem(
            @PathVariable UUID checklistId,
            @PathVariable UUID itemId) {
        return ResponseEntity.ok(complianceService.evaluateChecklistItem(checklistId, itemId));
    }

    @GetMapping("/expirations")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'COMPLIANCE_OFFICER', 'RECRUITER', 'BRANCH_MANAGER')")
    public ResponseEntity<List<ExpirationAlertDto>> getExpiringItems(
            @RequestParam(value = "tenantId", required = false) String tenantIdParam,
            @RequestHeader(value = "X-Tenant-ID", required = false) String tenantIdHeader) {
        String tenantId = tenantIdParam != null ? tenantIdParam
                : tenantIdHeader != null ? tenantIdHeader
                : "tenant-acme";
        return ResponseEntity.ok(complianceService.getExpiringItems(tenantId));
    }
}
