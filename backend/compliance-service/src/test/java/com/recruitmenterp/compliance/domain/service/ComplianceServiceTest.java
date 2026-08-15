package com.recruitmenterp.compliance.domain.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceChecklistRepository;
import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceRuleRepository;
import com.recruitmenterp.compliance.domain.model.ChecklistItem;
import com.recruitmenterp.compliance.domain.model.ComplianceChecklist;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ComplianceServiceTest {

    @Mock
    private ComplianceRuleRepository ruleRepository;

    @Mock
    private ComplianceChecklistRepository checklistRepository;

    @Mock
    private ComplianceRuleEngine ruleEngine;

    @InjectMocks
    private ComplianceService complianceService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createRule_ShouldReturnSavedRule() {
        ComplianceRule rule = ComplianceRule.builder().build();
        when(ruleRepository.save(rule)).thenReturn(rule);

        ComplianceRule result = complianceService.createRule(rule);

        assertNotNull(result);
        verify(ruleRepository).save(rule);
    }

    @Test
    void getAllRules_ShouldReturnRuleList() {
        ComplianceRule rule = ComplianceRule.builder().build();
        when(ruleRepository.findAll()).thenReturn(List.of(rule));

        List<ComplianceRule> result = complianceService.getAllRules();

        assertEquals(1, result.size());
        verify(ruleRepository).findAll();
    }

    @Test
    void getCandidateChecklist_WhenExists_ShouldReturnChecklist() {
        UUID id = UUID.randomUUID();
        ComplianceChecklist checklist = ComplianceChecklist.builder().build();
        when(checklistRepository.findByCandidateApplicationId(id)).thenReturn(Optional.of(checklist));

        ComplianceChecklist result = complianceService.getCandidateChecklist(id);

        assertNotNull(result);
        verify(checklistRepository).findByCandidateApplicationId(id);
    }

    @Test
    void getCandidateChecklist_WhenNotExists_ShouldThrowException() {
        UUID id = UUID.randomUUID();
        when(checklistRepository.findByCandidateApplicationId(id)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> complianceService.getCandidateChecklist(id));
    }

    @Test
    void evaluateChecklistItem_WhenExists_ShouldVerifyAndSave() {
        UUID checklistId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();

        ComplianceChecklist checklist = ComplianceChecklist.builder().build();
        ChecklistItem item = ChecklistItem.builder().id(itemId).build();
        checklist.setItems(List.of(item));

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(checklist));
        when(checklistRepository.save(checklist)).thenReturn(checklist);

        ComplianceChecklist result = complianceService.evaluateChecklistItem(checklistId, itemId);

        assertNotNull(result);
        verify(ruleEngine).verifyItem(checklist, item);
        verify(checklistRepository).save(checklist);
    }

    @Test
    void evaluateChecklistItem_WhenChecklistNotExists_ShouldThrowException() {
        UUID checklistId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        when(checklistRepository.findById(checklistId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> complianceService.evaluateChecklistItem(checklistId, itemId));
    }

    @Test
    void evaluateChecklistItem_WhenItemNotExists_ShouldThrowException() {
        UUID checklistId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();

        ComplianceChecklist checklist = ComplianceChecklist.builder().build();
        checklist.setItems(List.of());

        when(checklistRepository.findById(checklistId)).thenReturn(Optional.of(checklist));

        assertThrows(IllegalArgumentException.class, () -> complianceService.evaluateChecklistItem(checklistId, itemId));
    }

    @Test
    void getExpiringItems_ShouldReturnExpiringAlerts() {
        String tenantId = "tenant-1";
        java.time.LocalDate threshold = java.time.LocalDate.now().plusDays(30);

        ComplianceChecklist checklist = ComplianceChecklist.builder()
                .candidateApplicationId(UUID.randomUUID())
                .id(UUID.randomUUID())
                .build();
        
        UUID ruleId = UUID.randomUUID();
        ChecklistItem item = ChecklistItem.builder()
                .id(UUID.randomUUID())
                .ruleId(ruleId)
                .expiryDate(java.time.LocalDate.now().plusDays(10))
                .status(com.recruitmenterp.compliance.domain.model.ChecklistItemStatus.SUBMITTED)
                .build();
        checklist.setItems(List.of(item));

        ComplianceRule rule = ComplianceRule.builder()
                .id(ruleId)
                .documentType("PASSPORT")
                .build();

        when(checklistRepository.findWithExpiringItems(eq(tenantId), any(), any())).thenReturn(List.of(checklist));
        when(ruleRepository.findById(ruleId)).thenReturn(Optional.of(rule));

        List<com.recruitmenterp.compliance.adapter.in.web.ExpirationAlertDto> alerts = complianceService.getExpiringItems(tenantId);

        assertEquals(1, alerts.size());
        assertEquals("PASSPORT", alerts.get(0).getDocumentType());
        assertEquals(checklist.getCandidateApplicationId(), alerts.get(0).getCandidateApplicationId());
    }
}
