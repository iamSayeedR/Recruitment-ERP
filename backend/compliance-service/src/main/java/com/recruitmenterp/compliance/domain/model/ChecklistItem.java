package com.recruitmenterp.compliance.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "checklist_items")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checklist_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ComplianceChecklist checklist;

    @Column(name = "rule_id", nullable = false)
    private UUID ruleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChecklistItemStatus status;

    @Column(name = "document_reference")
    private String documentReference;

    @Column(name = "verified_by")
    private String verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "notes")
    private String notes;

    @Column(name = "stage_required_by")
    private Integer stageRequiredBy;

    /** Resolved at query time — not persisted, serialized to JSON for the frontend. */
    @Transient
    private ComplianceRule rule;
}
