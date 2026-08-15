package com.recruitmenterp.candidate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class CandidateControllerIT {

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
    private MockMvc mockMvc;

    @MockBean
    private com.recruitmenterp.candidate.application.service.CandidateService candidateService;

    @Test
    void testGetCandidate_Unauthorized_401() throws Exception {
        mockMvc.perform(get("/api/v1/candidates/" + UUID.randomUUID()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetCandidate_ForbiddenRole_403() throws Exception {
        // CLIENT_USER is not authorized to view candidate profiles (requires RECRUITER or COMPLIANCE_OFFICER)
        mockMvc.perform(get("/api/v1/candidates/" + UUID.randomUUID())
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("CLIENT_USER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_CLIENT_USER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreateCandidate_ForbiddenRole_403() throws Exception {
        mockMvc.perform(post("/api/v1/candidates")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("CANDIDATE")))
                ).authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreateCandidate_Authorized() throws Exception {
        mockMvc.perform(post("/api/v1/candidates")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("RECRUITER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                // Can be 200, 201, or 400 depending on payload validation and service. Just check it's not 401/403
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    System.out.println("DEBUG CREATE STATUS: " + status);
                    System.out.println("DEBUG CREATE BODY: " + result.getResponse().getContentAsString());
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403);
                });
    }

    @Test
    void testGetCandidate_Authorized() throws Exception {
        mockMvc.perform(get("/api/v1/candidates/" + UUID.randomUUID())
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("COMPLIANCE_OFFICER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_COMPLIANCE_OFFICER"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403);
                });
    }

    @Test
    void testBulkUpload_ForbiddenRole_403() throws Exception {
        mockMvc.perform(post("/api/v1/candidates/bulk-upload")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"csvContent\":\"data\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("COMPLIANCE_OFFICER"))) // Only RECRUITER allowed
                ).authorities(new SimpleGrantedAuthority("ROLE_COMPLIANCE_OFFICER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testBulkUpload_Authorized() throws Exception {
        mockMvc.perform(post("/api/v1/candidates/bulk-upload")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"csvContent\":\"data\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("RECRUITER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403);
                });
    }

    @Test
    void testUploadDocument_ForbiddenRole_403() throws Exception {
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile("file", "test.pdf", "application/pdf", "dummy".getBytes());
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/v1/candidates/" + UUID.randomUUID() + "/documents")
                .file(file)
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("CANDIDATE")))
                ).authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUploadDocument_Authorized() throws Exception {
        org.springframework.mock.web.MockMultipartFile file = new org.springframework.mock.web.MockMultipartFile("file", "test.pdf", "application/pdf", "dummy".getBytes());
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart("/api/v1/candidates/" + UUID.randomUUID() + "/documents")
                .file(file)
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("RECRUITER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403);
                });
    }
    @Test
    void testUpdateCandidate_ForbiddenRole_403() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/candidates/" + UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"firstName\":\"John\",\"lastName\":\"Doe\"}")
                .with(jwt().jwt(builder -> builder.claim("tenant_id", "tenant-a").claim("realm_access", Map.of("roles", List.of("CANDIDATE")))).authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateCandidate_Authorized() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/candidates/" + UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"firstName\":\"John\",\"lastName\":\"Doe\"}")
                .with(jwt().jwt(builder -> builder.claim("tenant_id", "tenant-a").claim("realm_access", Map.of("roles", List.of("RECRUITER")))).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403);
                });
    }

    @Test
    void testDeleteCandidate_ForbiddenRole_403() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/v1/candidates/" + UUID.randomUUID())
                .with(jwt().jwt(builder -> builder.claim("tenant_id", "tenant-a").claim("realm_access", Map.of("roles", List.of("COMPLIANCE_OFFICER")))).authorities(new SimpleGrantedAuthority("ROLE_COMPLIANCE_OFFICER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testDeleteCandidate_Authorized() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/v1/candidates/" + UUID.randomUUID())
                .with(jwt().jwt(builder -> builder.claim("tenant_id", "tenant-a").claim("realm_access", Map.of("roles", List.of("RECRUITER")))).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403);
                });
    }

    @Test
    void testUpdateApplicationStatus_ForbiddenRole_403() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/candidates/applications/" + UUID.randomUUID() + "/status")
                .param("status", "SCREENING")
                .with(jwt().jwt(builder -> builder.claim("tenant_id", "tenant-a").claim("realm_access", Map.of("roles", List.of("CANDIDATE")))).authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateApplicationStatus_Authorized() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch("/api/v1/candidates/applications/" + UUID.randomUUID() + "/status")
                .param("status", "SCREENING")
                .with(jwt().jwt(builder -> builder.claim("tenant_id", "tenant-a").claim("realm_access", Map.of("roles", List.of("RECRUITER")))).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    org.junit.jupiter.api.Assertions.assertTrue(status != 401 && status != 403);
                });
    }
}
