package com.recruitmenterp.requisition.domain.model;

import jakarta.persistence.*;
import java.time.Instant;

@Embeddable
public class RequisitionStatusHistory {

    @Enumerated(EnumType.STRING)
    private RequisitionStatus status;
    private String changedBy;
    private Instant changedAt;
    private String notes;

    protected RequisitionStatusHistory() {}

    public RequisitionStatusHistory(RequisitionStatus status, String changedBy, Instant changedAt, String notes) {
        this.status = status;
        this.changedBy = changedBy;
        this.changedAt = changedAt;
        this.notes = notes;
    }

    public RequisitionStatus getStatus() {
        return status;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public Instant getChangedAt() {
        return changedAt;
    }

    public String getNotes() {
        return notes;
    }
}
