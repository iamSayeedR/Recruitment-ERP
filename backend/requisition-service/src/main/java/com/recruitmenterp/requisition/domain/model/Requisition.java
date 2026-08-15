package com.recruitmenterp.requisition.domain.model;

import com.recruitmenterp.common.multitenancy.TenantAwareBaseEntity;
import com.recruitmenterp.common.exception.InvalidStateTransitionException;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "requisitions")
public class Requisition extends TenantAwareBaseEntity {

    private UUID clientId;
    private UUID branchId;

    @NotBlank
    @Size(max = 100)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private JobCategory jobCategory;

    private String destinationCountry;

    @Min(1)
    private int positionsRequired;

    @Min(0)
    private int positionsFilled;

    private String salaryRange;
    private String benefits;
    private Integer contractDuration;

    private String requiredSkills;
    private String requiredCertifications;

    @Enumerated(EnumType.STRING)
    private RequisitionStatus status;

    @Enumerated(EnumType.STRING)
    private RequisitionPriority priority;

    private String approvedBy;
    private Instant approvalDate;

    @ElementCollection
    @CollectionTable(name = "requisition_status_history", joinColumns = @JoinColumn(name = "requisition_id"))
    private List<RequisitionStatusHistory> statusHistory = new ArrayList<>();

    protected Requisition() {}

    public Requisition(UUID clientId, UUID branchId, String title, String description, JobCategory jobCategory,
                       String destinationCountry, int positionsRequired, String salaryRange, String benefits,
                       Integer contractDuration, String requiredSkills, String requiredCertifications, RequisitionPriority priority) {
        this.clientId = clientId;
        this.branchId = branchId;
        this.title = title;
        this.description = description;
        this.jobCategory = jobCategory;
        this.destinationCountry = destinationCountry;
        this.positionsRequired = positionsRequired;
        this.positionsFilled = 0;
        this.salaryRange = salaryRange;
        this.benefits = benefits;
        this.contractDuration = contractDuration;
        this.requiredSkills = requiredSkills;
        this.requiredCertifications = requiredCertifications;
        this.priority = priority;
        this.status = RequisitionStatus.DRAFT;
        addHistory(this.status, "SYSTEM", "Initial Creation");
    }

    public void transitionTo(RequisitionStatus newStatus, String actor, String notes) {
        if (!isValidTransition(this.status, newStatus)) {
            throw new InvalidStateTransitionException("Cannot transition from " + this.status + " to " + newStatus);
        }
        this.status = newStatus;
        if (newStatus == RequisitionStatus.APPROVED) {
            this.approvedBy = actor;
            this.approvalDate = Instant.now();
        }
        addHistory(newStatus, actor, notes);
    }

    private boolean isValidTransition(RequisitionStatus current, RequisitionStatus next) {
        if (next == RequisitionStatus.CLOSED || next == RequisitionStatus.CANCELLED) {
            return true;
        }
        return switch (current) {
            case DRAFT -> next == RequisitionStatus.APPROVED;
            case APPROVED -> next == RequisitionStatus.PUBLISHED;
            case PUBLISHED -> next == RequisitionStatus.PARTIALLY_FILLED || next == RequisitionStatus.FILLED;
            case PARTIALLY_FILLED -> next == RequisitionStatus.FILLED;
            case FILLED, CLOSED, CANCELLED -> true;
        };
    }

    private void addHistory(RequisitionStatus newStatus, String actor, String notes) {
        this.statusHistory.add(new RequisitionStatusHistory(newStatus, actor, Instant.now(), notes));
    }

    public void fillPositions(int count) {
        if (this.positionsFilled + count > this.positionsRequired) {
            throw new IllegalArgumentException("Cannot fill more positions than required");
        }
        this.positionsFilled += count;
    }

    // Getters and Setters

    public UUID getClientId() { return clientId; }
    public void setClientId(UUID clientId) { this.clientId = clientId; }
    public UUID getBranchId() { return branchId; }
    public void setBranchId(UUID branchId) { this.branchId = branchId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public JobCategory getJobCategory() { return jobCategory; }
    public void setJobCategory(JobCategory jobCategory) { this.jobCategory = jobCategory; }
    public String getDestinationCountry() { return destinationCountry; }
    public void setDestinationCountry(String destinationCountry) { this.destinationCountry = destinationCountry; }
    public int getPositionsRequired() { return positionsRequired; }
    public void setPositionsRequired(int positionsRequired) { this.positionsRequired = positionsRequired; }
    public int getPositionsFilled() { return positionsFilled; }
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public String getBenefits() { return benefits; }
    public void setBenefits(String benefits) { this.benefits = benefits; }
    public Integer getContractDuration() { return contractDuration; }
    public void setContractDuration(Integer contractDuration) { this.contractDuration = contractDuration; }
    public String getRequiredSkills() { return requiredSkills; }
    public void setRequiredSkills(String requiredSkills) { this.requiredSkills = requiredSkills; }
    public String getRequiredCertifications() { return requiredCertifications; }
    public void setRequiredCertifications(String requiredCertifications) { this.requiredCertifications = requiredCertifications; }
    public RequisitionStatus getStatus() { return status; }
    public RequisitionPriority getPriority() { return priority; }
    public void setPriority(RequisitionPriority priority) { this.priority = priority; }
    public String getApprovedBy() { return approvedBy; }
    public Instant getApprovalDate() { return approvalDate; }
    public List<RequisitionStatusHistory> getStatusHistory() { return statusHistory; }
}
