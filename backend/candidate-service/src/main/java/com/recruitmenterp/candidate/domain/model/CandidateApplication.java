package com.recruitmenterp.candidate.domain.model;

import com.recruitmenterp.common.multitenancy.TenantAwareBaseEntity;
import com.recruitmenterp.common.exception.InvalidStateTransitionException;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "candidate_applications")
@Getter
@Setter
public class CandidateApplication extends TenantAwareBaseEntity {

    private UUID candidateId;
    private UUID requisitionId;

    @Transient
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    private CandidateApplicationStatus status;

    private String interviewNotes;
    private BigDecimal offeredSalary;
    private LocalDate startDate;

    public void transitionTo(CandidateApplicationStatus newStatus, String actor) {
        if (newStatus == null) {
            throw new InvalidStateTransitionException("Target status cannot be null");
        }
        this.status = newStatus;
    }
}
