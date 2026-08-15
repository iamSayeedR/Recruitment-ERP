package com.recruitmenterp.iam.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Represents a root Tenant in the system.
 */
@Entity
@Table(name = "tenants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false, unique = true)
    private String subdomain;

    private String logoUrl;
    private String primaryColor;
    private String secondaryColor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TenantStatus status;

    private String subscriptionPlan;
    private Integer dataRetentionDays;

    @CreationTimestamp
    @Column(updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    public void activate() {
        if (this.status == TenantStatus.DEACTIVATED) {
            throw new IllegalStateException("Cannot activate a deactivated tenant");
        }
        this.status = TenantStatus.ACTIVE;
    }

    public void suspend() {
        if (this.status != TenantStatus.ACTIVE) {
            throw new IllegalStateException("Can only suspend active tenants");
        }
        this.status = TenantStatus.SUSPENDED;
    }

    public void deactivate() {
        this.status = TenantStatus.DEACTIVATED;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tenant tenant = (Tenant) o;
        return Objects.equals(id, tenant.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
