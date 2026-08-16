package com.recruitmenterp.candidate.adapter.out.persistence;

import com.recruitmenterp.candidate.domain.model.CandidateApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateApplicationRepository extends JpaRepository<CandidateApplication, UUID> {
    List<CandidateApplication> findByRequisitionId(UUID requisitionId);
    List<CandidateApplication> findByCandidateId(UUID candidateId);
}
