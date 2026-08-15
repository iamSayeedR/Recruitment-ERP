package com.recruitmenterp.candidate;

import static org.junit.jupiter.api.Assertions.*;

import com.recruitmenterp.candidate.domain.model.*;
import com.recruitmenterp.candidate.adapter.out.persistence.CandidateRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.time.LocalDate;
import java.util.List;

@SpringBootTest
@Testcontainers
@Transactional
class CandidateRlsIT {

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
    private CandidateRepository candidateRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void testCrossTenantRlsIsolation() {
        // Create a normal user for RLS testing since app_user is a superuser and bypasses RLS
        jdbcTemplate.execute("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_tester') THEN CREATE ROLE rls_tester; END IF; END $$;");
        jdbcTemplate.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rls_tester");
        jdbcTemplate.execute("SET LOCAL ROLE rls_tester");

        // 1. Seed Candidate under Tenant A
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-a'");
        
        Candidate candidate = new Candidate();
        candidate.setTenantId("tenant-a");
        candidate.setFirstName("Alice");
        candidate.setLastName("Smith");
        candidate.setEmail("alice@dev.com");
        candidate.setStatus(CandidateStatus.REGISTERED);
        candidateRepository.saveAndFlush(candidate);

        // 2. Authenticate as Tenant B and verify RLS filters out Alice
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-b'");
        List<Candidate> tenantBData = candidateRepository.findAll();
        assertTrue(tenantBData.isEmpty(), "RLS should filter out Tenant A's candidate data for Tenant B");

        // 3. Authenticate as Tenant A and verify we can read Alice
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-a'");
        List<Candidate> tenantAData = candidateRepository.findAll();
        assertEquals(1, tenantAData.size(), "Tenant A should see their own candidate data");
    }
}
