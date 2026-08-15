package com.recruitmenterp.requisition;

import static org.junit.jupiter.api.Assertions.*;

import com.recruitmenterp.requisition.domain.model.*;
import com.recruitmenterp.requisition.adapter.out.persistence.RequisitionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.util.List;
import java.util.UUID;

@SpringBootTest
@Testcontainers
@Transactional
@ActiveProfiles("test")
class RequisitionRlsIT {

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
    private RequisitionRepository requisitionRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void testCrossTenantRlsIsolation() {
        // Create a normal user for RLS testing since app_user is a superuser and bypasses RLS
        jdbcTemplate.execute("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_tester') THEN CREATE ROLE rls_tester; END IF; END $$;");
        jdbcTemplate.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rls_tester");
        jdbcTemplate.execute("SET LOCAL ROLE rls_tester");

        // 1. Seed Requisition under Tenant A
        // Set local session variable to Tenant A for seed
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-a'");
        
        Requisition req = new Requisition(
            UUID.randomUUID(),
            UUID.randomUUID(),
            "Software Engineer",
            "Description",
            JobCategory.WHITE_COLLAR,
            "UAE",
            5,
            "1000-2000",
            "None",
            24,
            "Java",
            "None",
            RequisitionPriority.MEDIUM
        );
        req.setTenantId("tenant-a");
        requisitionRepository.saveAndFlush(req);

        // 2. Authenticate as Tenant B and verify we cannot access Tenant A's data
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-b'");
        List<Requisition> tenantBData = requisitionRepository.findAll();
        assertTrue(tenantBData.isEmpty(), "RLS should filter out Tenant A's data for Tenant B");

        // 3. Authenticate as Tenant A and verify we can access it
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-a'");
        List<Requisition> tenantAData = requisitionRepository.findAll();
        assertEquals(1, tenantAData.size(), "Tenant A should see their own data");
    }
}
