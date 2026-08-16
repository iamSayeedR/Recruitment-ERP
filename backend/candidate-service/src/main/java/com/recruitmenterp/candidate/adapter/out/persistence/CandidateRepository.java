package com.recruitmenterp.candidate.adapter.out.persistence;

import com.recruitmenterp.candidate.domain.model.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    Page<Candidate> findAllByTenantId(String tenantId, Pageable pageable);

    @Query("SELECT c FROM Candidate c LEFT JOIN FETCH c.documents WHERE c.id = :id")
    Optional<Candidate> findByIdWithDocuments(@Param("id") UUID id);
}
