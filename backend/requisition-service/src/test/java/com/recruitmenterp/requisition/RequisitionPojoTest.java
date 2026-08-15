package com.recruitmenterp.requisition;

import static org.junit.jupiter.api.Assertions.*;

import com.recruitmenterp.requisition.domain.model.*;
import org.junit.jupiter.api.Test;
import java.time.Instant;
import java.util.UUID;

class RequisitionPojoTest {

    @Test
    void testRequisitionPojoGettersAndSetters() {
        UUID clientId = UUID.randomUUID();
        UUID branchId = UUID.randomUUID();
        Requisition req = new Requisition(
            clientId,
            branchId,
            "Software Engineer",
            "Job Description",
            JobCategory.WHITE_COLLAR,
            "Germany",
            5,
            "100k",
            "Health",
            12,
            "Java",
            "AWS",
            RequisitionPriority.HIGH
        );

        // Verify constructor and getters
        assertEquals(clientId, req.getClientId());
        assertEquals(branchId, req.getBranchId());
        assertEquals("Software Engineer", req.getTitle());
        assertEquals("Job Description", req.getDescription());
        assertEquals(JobCategory.WHITE_COLLAR, req.getJobCategory());
        assertEquals("Germany", req.getDestinationCountry());
        assertEquals(5, req.getPositionsRequired());
        assertEquals(0, req.getPositionsFilled());
        assertEquals("100k", req.getSalaryRange());
        assertEquals("Health", req.getBenefits());
        assertEquals(12, req.getContractDuration());
        assertEquals("Java", req.getRequiredSkills());
        assertEquals("AWS", req.getRequiredCertifications());
        assertEquals(RequisitionStatus.DRAFT, req.getStatus());
        assertEquals(RequisitionPriority.HIGH, req.getPriority());

        // Test Setters
        UUID newClient = UUID.randomUUID();
        UUID newBranch = UUID.randomUUID();
        req.setClientId(newClient);
        req.setBranchId(newBranch);
        req.setTitle("Senior Engineer");
        req.setDescription("Updated Description");
        req.setJobCategory(JobCategory.BLUE_COLLAR);
        req.setDestinationCountry("Canada");
        req.setPositionsRequired(10);
        req.setSalaryRange("150k");
        req.setBenefits("Dental");
        req.setContractDuration(24);
        req.setRequiredSkills("Go");
        req.setRequiredCertifications("Kubernetes");
        req.setPriority(RequisitionPriority.URGENT);

        assertEquals(newClient, req.getClientId());
        assertEquals(newBranch, req.getBranchId());
        assertEquals("Senior Engineer", req.getTitle());
        assertEquals("Updated Description", req.getDescription());
        assertEquals(JobCategory.BLUE_COLLAR, req.getJobCategory());
        assertEquals("Canada", req.getDestinationCountry());
        assertEquals(10, req.getPositionsRequired());
        assertEquals("150k", req.getSalaryRange());
        assertEquals("Dental", req.getBenefits());
        assertEquals(24, req.getContractDuration());
        assertEquals("Go", req.getRequiredSkills());
        assertEquals("Kubernetes", req.getRequiredCertifications());
        assertEquals(RequisitionPriority.URGENT, req.getPriority());

        req.fillPositions(3);
        assertEquals(3, req.getPositionsFilled());
        assertThrows(IllegalArgumentException.class, () -> req.fillPositions(10));
    }

    @Test
    void testRequisitionStatusHistoryPojo() {
        Instant now = Instant.now();
        RequisitionStatusHistory history = new RequisitionStatusHistory(
            RequisitionStatus.APPROVED,
            "admin",
            now,
            "Looks good"
        );

        assertEquals(RequisitionStatus.APPROVED, history.getStatus());
        assertEquals("admin", history.getChangedBy());
        assertEquals(now, history.getChangedAt());
        assertEquals("Looks good", history.getNotes());
    }
}
