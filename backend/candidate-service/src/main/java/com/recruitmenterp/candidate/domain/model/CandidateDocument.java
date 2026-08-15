package com.recruitmenterp.candidate.domain.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "candidate_documents")
@Getter
@Setter
public class CandidateDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String fileName;
    private String fileType;
    @Column(name = "s3_key")
    private String s3Key;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status;

    private LocalDateTime uploadedAt;
    private String uploadedBy;
}
