package com.recruitmenterp.candidate.adapter.out.persistence;

import com.recruitmenterp.candidate.domain.model.CandidateDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CandidateDocumentRepository extends JpaRepository<CandidateDocument, UUID> {
}
