package com.recruitmenterp.compliance.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "compliance_rules")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ComplianceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "destination_country")
    private String destinationCountry;

    @Column(name = "source_country")
    private String sourceCountry;

    @Column(name = "job_category")
    private String jobCategory;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "is_required", nullable = false)
    private boolean required;

    @Column(name = "validity_period_days")
    private Integer validityPeriodDays;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_rules", columnDefinition = "jsonb")
    private String validationRules;

    @Column(name = "stage_required_by")
    private Integer stageRequiredBy;

    @Column(name = "active", nullable = false)
    private boolean active;
}
