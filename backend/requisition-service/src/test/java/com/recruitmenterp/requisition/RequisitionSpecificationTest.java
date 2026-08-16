package com.recruitmenterp.requisition;

import com.recruitmenterp.requisition.adapter.out.persistence.RequisitionRepository;
import com.recruitmenterp.requisition.adapter.out.persistence.RequisitionSpecification;
import com.recruitmenterp.requisition.domain.model.JobCategory;
import com.recruitmenterp.requisition.domain.model.Requisition;
import com.recruitmenterp.requisition.domain.model.RequisitionPriority;
import com.recruitmenterp.requisition.domain.model.RequisitionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class RequisitionSpecificationTest {

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
    private RequisitionRepository repository;

    private UUID branchA = UUID.randomUUID();
    private UUID branchB = UUID.randomUUID();
    private UUID clientA = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        repository.deleteAll();

        Requisition req1 = new Requisition(clientA, branchA, "Dev", "Desc", JobCategory.WHITE_COLLAR, "UAE", 1, null, null, null, null, null, RequisitionPriority.HIGH);
        req1.setTenantId("tenant-1");
        
        Requisition req2 = new Requisition(clientA, branchB, "Driver", "Desc", JobCategory.BLUE_COLLAR, "Oman", 2, null, null, null, null, null, RequisitionPriority.LOW);
        req2.setTenantId("tenant-1");

        repository.saveAll(List.of(req1, req2));
    }

    @Test
    void testFilterByCategory() {
        var spec = RequisitionSpecification.withFilters(JobCategory.WHITE_COLLAR, null, null, null);
        var results = repository.findAll(spec);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getJobCategory()).isEqualTo(JobCategory.WHITE_COLLAR);
    }

    @Test
    void testFilterByCountry() {
        var spec = RequisitionSpecification.withFilters(null, "Oman", null, null);
        var results = repository.findAll(spec);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getDestinationCountry()).isEqualTo("Oman");
    }

    @Test
    void testFilterByStatus() {
        var spec = RequisitionSpecification.withFilters(null, null, RequisitionStatus.DRAFT, null);
        var results = repository.findAll(spec);
        assertThat(results).hasSize(2);
    }

    @Test
    void testFilterByBranchScope() {
        var spec = RequisitionSpecification.withFilters(null, null, null, branchA.toString());
        var results = repository.findAll(spec);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getBranchId()).isEqualTo(branchA);
    }

    @Test
    void testMultipleFilters() {
        var spec = RequisitionSpecification.withFilters(JobCategory.WHITE_COLLAR, "UAE", RequisitionStatus.DRAFT, branchA.toString());
        var results = repository.findAll(spec);
        assertThat(results).hasSize(1);
    }
}
