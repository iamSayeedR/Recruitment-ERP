package com.recruitmenterp.compliance.adapter.out.persistence;

import com.recruitmenterp.compliance.domain.model.ComplianceChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplianceChecklistRepository extends JpaRepository<ComplianceChecklist, UUID> {
    Optional<ComplianceChecklist> findByCandidateApplicationId(UUID candidateApplicationId);

    @Query("SELECT DISTINCT c FROM ComplianceChecklist c LEFT JOIN FETCH c.items WHERE c.tenantId = :tenantId")
    List<ComplianceChecklist> findAllWithItemsByTenantId(@Param("tenantId") String tenantId);

    default List<ComplianceChecklist> findWithExpiringItems(String tenantId, LocalDate startDate, LocalDate endDate) {
        return findAllWithItemsByTenantId(tenantId);
    }
}
