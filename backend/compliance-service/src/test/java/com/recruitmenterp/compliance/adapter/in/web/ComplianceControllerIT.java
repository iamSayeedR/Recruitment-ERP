package com.recruitmenterp.compliance.adapter.in.web;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitmenterp.compliance.domain.model.ComplianceRule;
import com.recruitmenterp.compliance.domain.service.ComplianceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.util.UUID;

@WebMvcTest(ComplianceController.class)
@ActiveProfiles("test")
@EnableMethodSecurity
class ComplianceControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ComplianceService complianceService; // Mocked because we only want to test RBAC and controller here. 
    // Actually wait, the instruction says "exhaustive RBAC testing" on IT. It might be better to just test authorization with mockmvc.

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void createRule_WithComplianceOfficer_ShouldReturnOk() throws Exception {
        ComplianceRule rule = ComplianceRule.builder()
                .tenantId("tenant1")
                .documentType("Passport")
                .active(true)
                .build();

        mockMvc.perform(post("/api/v1/compliance/rules").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rule)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void createRule_WithRecruiter_ShouldReturnForbidden() throws Exception {
        ComplianceRule rule = ComplianceRule.builder()
                .tenantId("tenant1")
                .documentType("Passport")
                .active(true)
                .build();

        mockMvc.perform(post("/api/v1/compliance/rules").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rule)))
                .andExpect(status().isForbidden());
    }

    @Test
    void createRule_WithoutUser_ShouldReturnUnauthorized() throws Exception {
        ComplianceRule rule = ComplianceRule.builder()
                .tenantId("tenant1")
                .documentType("Passport")
                .active(true)
                .build();

        mockMvc.perform(post("/api/v1/compliance/rules").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rule)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void getAllRules_WithComplianceOfficer_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/v1/compliance/rules"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void getAllRules_WithRecruiter_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/v1/compliance/rules"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllRules_WithoutUser_ShouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/compliance/rules"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void getCandidateChecklist_WithRecruiter_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/v1/compliance/checklists/candidate/" + UUID.randomUUID()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "CANDIDATE")
    void getCandidateChecklist_WithCandidate_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/compliance/checklists/candidate/" + UUID.randomUUID()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void verifyChecklistItem_WithComplianceOfficer_ShouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/v1/compliance/checklists/" + UUID.randomUUID() + "/items/" + UUID.randomUUID() + "/verify").with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void verifyChecklistItem_WithRecruiter_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/v1/compliance/checklists/" + UUID.randomUUID() + "/items/" + UUID.randomUUID() + "/verify").with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "COMPLIANCE_OFFICER")
    void getExpiringItems_WithComplianceOfficer_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/v1/compliance/expirations").header("X-Tenant-ID", "tenant-1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECRUITER")
    void getExpiringItems_WithRecruiter_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/compliance/expirations").header("X-Tenant-ID", "tenant-1"))
                .andExpect(status().isForbidden());
    }
}
