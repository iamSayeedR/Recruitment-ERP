package com.recruitmenterp.iam.security;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import java.util.Map;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class ClientControllerSecurityIT {

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

    @org.springframework.boot.test.mock.mockito.MockBean
    private com.recruitmenterp.iam.application.service.ClientService clientService;

    @Test
    void testCreateClient_Admin_Allowed() throws Exception {
        mockMvc.perform(post("/api/v1/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test Client\",\"industry\":\"Tech\"}")
                .with(jwt().jwt(jwt -> jwt.claim("realm_access", Map.of("roles", List.of("TENANT_ADMIN"))).claim("tenant_id", "tenant-123"))))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateClient_Recruiter_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/clients")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test Client\",\"industry\":\"Tech\"}")
                .with(jwt().jwt(jwt -> jwt.claim("realm_access", Map.of("roles", List.of("RECRUITER"))).claim("tenant_id", "tenant-123"))))
                .andExpect(status().isForbidden());
    }
}
