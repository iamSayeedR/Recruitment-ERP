package com.recruitmenterp.compliance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceChecklistRepository;
import com.recruitmenterp.compliance.adapter.out.persistence.ComplianceRuleRepository;
import com.recruitmenterp.compliance.domain.model.CandidateComplianceContext;
import com.recruitmenterp.compliance.domain.model.ChecklistItem;
import com.recruitmenterp.compliance.domain.model.ChecklistItemStatus;
import com.recruitmenterp.compliance.domain.model.ComplianceChecklist;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import com.recruitmenterp.compliance.domain.service.ComplianceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(properties = {
    "spring.kafka.listener.auto-startup=false",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration"
})
@Testcontainers
@ActiveProfiles("test")
@Transactional
class ChecklistGenerationIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("recruitment_erp")
            .withUsername("app_user")
            .withPassword("app_password");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
    }


    @Autowired
    private ComplianceService complianceService;

    @Autowired
    private ComplianceRuleRepository ruleRepository;

    @Autowired
    private ComplianceChecklistRepository checklistRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        ruleRepository.deleteAll();
        checklistRepository.deleteAll();

        ComplianceRule rule1 = ComplianceRule.builder()
                .tenantId("tenant-1")
                .destinationCountry("SA")
                .sourceCountry("IN")
                .jobCategory("BLUE_COLLAR")
                .documentType("PASSPORT")
                .required(true)
                .active(true)
                .stageRequiredBy(1)
                .validationRules("{\"min_passport_validity_months\": 6}")
                .build();
                
        ComplianceRule rule2 = ComplianceRule.builder()
                .tenantId("tenant-1")
                .destinationCountry("SA")
                .sourceCountry("IN")
                .jobCategory("BLUE_COLLAR")
                .documentType("MEDICAL_CERTIFICATE")
                .required(true)
                .active(true)
                .stageRequiredBy(2)
                .validationRules(null)
                .build();
                
        ruleRepository.save(rule1);
        ruleRepository.save(rule2);
    }

    @Test
    void testChecklistGeneration_ValidPassport() {
        UUID candidateId = UUID.randomUUID();
        CandidateComplianceContext context = CandidateComplianceContext.builder()
                .candidateApplicationId(candidateId)
                .tenantId("tenant-1")
                .destinationCountry("SA")
                .sourceCountry("IN")
                .jobCategory("BLUE_COLLAR")
                .targetOnboardingDate(LocalDate.now())
                .expiryAlertDate(LocalDate.now().plusMonths(7))
                .build();

        ComplianceChecklist checklist = complianceService.generateChecklist(context);
        
        assertNotNull(checklist.getId());
        assertEquals(2, checklist.getItems().size());
        
        ChecklistItem passportItem = checklist.getItems().stream()
                .filter(i -> i.getStageRequiredBy() == 1)
                .findFirst().orElseThrow();
                
        ChecklistItem medicalItem = checklist.getItems().stream()
                .filter(i -> i.getStageRequiredBy() == 2)
                .findFirst().orElseThrow();
                
        assertEquals(ChecklistItemStatus.SUBMITTED, passportItem.getStatus());
        assertEquals(ChecklistItemStatus.SUBMITTED, medicalItem.getStatus());
    }

    @Test
    void testChecklistGeneration_InvalidPassport() {
        UUID candidateId = UUID.randomUUID();
        CandidateComplianceContext context = CandidateComplianceContext.builder()
                .candidateApplicationId(candidateId)
                .tenantId("tenant-1")
                .destinationCountry("SA")
                .sourceCountry("IN")
                .jobCategory("BLUE_COLLAR")
                .targetOnboardingDate(LocalDate.now())
                .expiryAlertDate(LocalDate.now().plusMonths(3)) // invalid
                .build();

        ComplianceChecklist checklist = complianceService.generateChecklist(context);
        
        assertNotNull(checklist.getId());
        assertEquals(2, checklist.getItems().size());
        
        ChecklistItem passportItem = checklist.getItems().stream()
                .filter(i -> i.getStageRequiredBy() == 1)
                .findFirst().orElseThrow();
                
        assertEquals(ChecklistItemStatus.NOT_STARTED, passportItem.getStatus());
    }
}
