package com.recruitmenterp.requisition;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.util.List;
import java.util.List;
import java.util.Map;

import com.recruitmenterp.requisition.application.service.RequisitionService;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
class RequisitionControllerIT {

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
    private RequisitionService requisitionService;

    @Test
    void testGetRequisitions_Unauthorized_401() throws Exception {
        mockMvc.perform(get("/api/v1/requisitions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetRequisitions_AllowedRole_Success() throws Exception {
        mockMvc.perform(get("/api/v1/requisitions")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("RECRUITER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateRequisition_ForbiddenRole_403() throws Exception {
        mockMvc.perform(post("/api/v1/requisitions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Software Engineer\",\"jobCategory\":\"BLUE_COLLAR\",\"positionsRequired\":2,\"priority\":\"HIGH\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("CANDIDATE")))
                ).authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testCreateRequisition_AllowedRole_Success() throws Exception {
        mockMvc.perform(post("/api/v1/requisitions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Software Engineer\",\"jobCategory\":\"BLUE_COLLAR\",\"positionsRequired\":2,\"priority\":\"HIGH\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("TENANT_ADMIN")))
                ).authorities(new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))))
                .andExpect(status().isCreated());
    }

    @Test
    void testGetRequisitionById_ForbiddenRole_403() throws Exception {
        mockMvc.perform(get("/api/v1/requisitions/" + java.util.UUID.randomUUID())
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("CANDIDATE")))
                ).authorities(new SimpleGrantedAuthority("ROLE_CANDIDATE"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetRequisitionById_AllowedRole_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/requisitions/" + java.util.UUID.randomUUID())
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("BRANCH_MANAGER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_BRANCH_MANAGER"))))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateRequisition_ForbiddenRole_403() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/requisitions/" + java.util.UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Updated\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("RECRUITER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_RECRUITER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateRequisition_AllowedRole_NotFound() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/api/v1/requisitions/" + java.util.UUID.randomUUID())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Updated\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("CLIENT_USER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_CLIENT_USER"))))
                .andExpect(status().isOk());
    }

    @Test
    void testTransitionStatus_ForbiddenRole_403() throws Exception {
        mockMvc.perform(post("/api/v1/requisitions/" + java.util.UUID.randomUUID() + "/transition")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"newStatus\":\"APPROVED\",\"notes\":\"Ok\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("CLIENT_USER")))
                ).authorities(new SimpleGrantedAuthority("ROLE_CLIENT_USER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void testTransitionStatus_AllowedRole_NotFound() throws Exception {
        mockMvc.perform(post("/api/v1/requisitions/" + java.util.UUID.randomUUID() + "/transition")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"newStatus\":\"APPROVED\",\"notes\":\"Ok\"}")
                .with(jwt().jwt(builder -> builder
                        .claim("tenant_id", "tenant-a")
                        .claim("realm_access", Map.of("roles", List.of("TENANT_ADMIN")))
                ).authorities(new SimpleGrantedAuthority("ROLE_TENANT_ADMIN"))))
                .andExpect(status().isOk());
    }
}
