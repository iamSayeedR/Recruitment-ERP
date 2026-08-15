package com.recruitmenterp.compliance.domain.service;

import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceChecklistRepository;
import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceRuleRepository;
import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceRuleSpecification;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import com.recruitmenterp.compliance.domain.model.ChecklistItem;
import com.recruitmenterp.compliance.domain.model.ChecklistItemStatus;
import com.recruitmenterp.compliance.domain.model.ComplianceChecklist;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ComplianceService {

    private final ComplianceRuleRepository ruleRepository;
    private final ComplianceChecklistRepository checklistRepository;
    private final ComplianceRuleEngine ruleEngine;
    private final com.recruitmenterp.common.event.DomainEventPublisher domainEventPublisher;

    public ComplianceService(ComplianceRuleRepository ruleRepository, ComplianceChecklistRepository checklistRepository,
                             ComplianceRuleEngine ruleEngine, @org.springframework.beans.factory.annotation.Autowired(required = false) com.recruitmenterp.common.event.DomainEventPublisher domainEventPublisher) {
        this.ruleRepository = ruleRepository;
        this.checklistRepository = checklistRepository;
        this.ruleEngine = ruleEngine;
        this.domainEventPublisher = domainEventPublisher;
    }

    @Transactional
    public ComplianceRule createRule(ComplianceRule rule) {
        return ruleRepository.save(rule);
    }

    public List<ComplianceRule> getAllRules() {
        return ruleRepository.findAll();
    }

    @Transactional
    public ComplianceChecklist getCandidateChecklist(UUID candidateApplicationId) {
        ComplianceChecklist checklist = checklistRepository.findByCandidateApplicationId(candidateApplicationId)
                .orElseGet(() -> checklistRepository.save(ComplianceChecklist.builder()
                        .tenantId("tenant-acme")
                        .candidateApplicationId(candidateApplicationId)
                        .items(new ArrayList<>())
                        .build()));

        List<UUID> ruleIds = checklist.getItems().stream()
                .map(ChecklistItem::getRuleId)
                .distinct()
                .toList();

        if (!ruleIds.isEmpty()) {
            Map<UUID, ComplianceRule> rulesById = ruleRepository.findAllById(ruleIds).stream()
                    .collect(Collectors.toMap(ComplianceRule::getId, r -> r));
            checklist.getItems().forEach(item -> item.setRule(rulesById.get(item.getRuleId())));
        }

        return checklist;
    }

    @Transactional
    public ComplianceChecklist addItemToCandidateChecklist(UUID candidateApplicationId, String documentType, String statusStr) {
        ComplianceChecklist checklist = checklistRepository.findByCandidateApplicationId(candidateApplicationId)
                .orElseGet(() -> checklistRepository.save(ComplianceChecklist.builder()
                        .tenantId("tenant-acme")
                        .candidateApplicationId(candidateApplicationId)
                        .items(new ArrayList<>())
                        .build()));

        final String docTypeFinal = (documentType != null && !documentType.isBlank()) ? documentType.trim() : "REQUIRED_DOCUMENT";

        ComplianceRule rule = ruleRepository.findAll().stream()
                .filter(r -> r.getDocumentType() != null && r.getDocumentType().equalsIgnoreCase(docTypeFinal))
                .findFirst()
                .orElseGet(() -> ruleRepository.save(ComplianceRule.builder()
                        .tenantId("tenant-acme")
                        .destinationCountry("Global")
                        .jobCategory("GENERAL")
                        .documentType(docTypeFinal)
                        .validityPeriodDays(180)
                        .stageRequiredBy(1)
                        .required(true)
                        .active(true)
                        .build()));

        ChecklistItemStatus status = ChecklistItemStatus.NOT_STARTED;
        try {
            if (statusStr != null && !statusStr.isBlank()) {
                status = ChecklistItemStatus.valueOf(statusStr.toUpperCase());
            }
        } catch (Exception ignored) {}

        ChecklistItem item = ChecklistItem.builder()
                .ruleId(rule.getId())
                .status(status)
                .stageRequiredBy(rule.getStageRequiredBy())
                .expiryDate(LocalDate.now().plusDays(180))
                .build();

        checklist.addItem(item);
        ComplianceChecklist saved = checklistRepository.save(checklist);

        List<UUID> ruleIds = saved.getItems().stream().map(ChecklistItem::getRuleId).distinct().toList();
        Map<UUID, ComplianceRule> rulesById = ruleRepository.findAllById(ruleIds).stream()
                .collect(Collectors.toMap(ComplianceRule::getId, r -> r));
        saved.getItems().forEach(i -> i.setRule(rulesById.get(i.getRuleId())));

        return saved;
    }

    @Transactional
    public ComplianceChecklist updateItemStatus(UUID checklistId, UUID itemId, String statusStr) {
        ComplianceChecklist checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist not found with id: " + checklistId));
        
        ChecklistItem item = checklist.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Item not found with id: " + itemId));

        try {
            item.setStatus(ChecklistItemStatus.valueOf(statusStr.toUpperCase()));
        } catch (Exception e) {
            item.setStatus(ChecklistItemStatus.IN_PROGRESS);
        }

        ComplianceChecklist saved = checklistRepository.save(checklist);

        List<UUID> ruleIds = saved.getItems().stream().map(ChecklistItem::getRuleId).distinct().toList();
        Map<UUID, ComplianceRule> rulesById = ruleRepository.findAllById(ruleIds).stream()
                .collect(Collectors.toMap(ComplianceRule::getId, r -> r));
        saved.getItems().forEach(i -> i.setRule(rulesById.get(i.getRuleId())));

        return saved;
    }

    @Transactional
    public ComplianceChecklist evaluateChecklistItem(UUID checklistId, UUID itemId) {
        ComplianceChecklist checklist = checklistRepository.findById(checklistId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist not found with id: " + checklistId));
        
        ChecklistItem itemToVerify = checklist.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Checklist item not found with id: " + itemId));
                
        ruleEngine.verifyItem(checklist, itemToVerify);
        
        ComplianceChecklist saved = checklistRepository.save(checklist);
        if (domainEventPublisher != null) {
            domainEventPublisher.publish("compliance-events", "ChecklistItemVerifiedEvent", checklist.getTenantId(), Map.of("status", itemToVerify.getStatus().name()));
        }
        return saved;
    }

    @Transactional
    public ComplianceChecklist generateChecklist(CandidateComplianceContext context) {
        List<ComplianceRule> rules = ruleRepository.findAll(ComplianceRuleSpecification.matchesContext(context));

        ComplianceChecklist checklist = ComplianceChecklist.builder()
                .tenantId(context.getTenantId())
                .candidateApplicationId(context.getCandidateApplicationId())
                .build();

        for (ComplianceRule rule : rules) {
            boolean passes = ruleEngine.evaluateRules(rule, context);
            ChecklistItemStatus status = passes ? ChecklistItemStatus.SUBMITTED : ChecklistItemStatus.NOT_STARTED;

            ChecklistItem item = ChecklistItem.builder()
                    .ruleId(rule.getId())
                    .status(status)
                    .stageRequiredBy(rule.getStageRequiredBy())
                    .build();

            checklist.addItem(item);
        }

        return checklistRepository.save(checklist);
    }

    public List<com.recruitmenterp.compliance.adapter.in.web.ExpirationAlertDto> getExpiringItems(String tenantId) {
        String effectiveTenant = (tenantId != null && !tenantId.isBlank()) ? tenantId : "tenant-acme";
        List<ComplianceChecklist> checklists = checklistRepository.findAllWithItemsByTenantId(effectiveTenant);
        
        List<com.recruitmenterp.compliance.adapter.in.web.ExpirationAlertDto> alerts = new java.util.ArrayList<>();
        for (ComplianceChecklist checklist : checklists) {
            if (checklist.getItems() == null) continue;
            for (ChecklistItem item : checklist.getItems()) {
                String docType = ruleRepository.findById(item.getRuleId())
                        .map(ComplianceRule::getDocumentType)
                        .orElse("REQUIRED_DOCUMENT");
                        
                alerts.add(com.recruitmenterp.compliance.adapter.in.web.ExpirationAlertDto.builder()
                        .candidateApplicationId(checklist.getCandidateApplicationId())
                        .documentType(docType)
                        .expiryDate(item.getExpiryDate() != null ? item.getExpiryDate() : LocalDate.now().plusDays(180))
                        .status(item.getStatus() != null ? item.getStatus().name() : "NOT_STARTED")
                        .checklistId(checklist.getId())
                        .itemId(item.getId())
                        .build());
            }
        }
        return alerts;
    }
}
