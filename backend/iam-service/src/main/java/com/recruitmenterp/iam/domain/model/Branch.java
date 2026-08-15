package com.recruitmenterp.iam.domain.model;

import com.recruitmenterp.common.multitenancy.TenantAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a branch office of a tenant.
 */
@Entity
@Table(name = "branches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch extends TenantAwareBaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    private String country;
    private String city;
    private String address;
    private String phone;
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BranchStatus status;

    public void activate() {
        this.status = BranchStatus.ACTIVE;
    }

    public void deactivate() {
        this.status = BranchStatus.INACTIVE;
    }

    public void close() {
        this.status = BranchStatus.CLOSED;
    }
}
