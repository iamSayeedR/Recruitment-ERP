package com.recruitmenterp.iam.domain.model;

import com.recruitmenterp.common.multitenancy.TenantAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a client (employer) in the recruitment system.
 */
@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client extends TenantAwareBaseEntity {

    @Column(nullable = false)
    private String name;

    private String industry;
    private String country;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClientStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public void activate() {
        this.status = ClientStatus.ACTIVE;
    }

    public void suspend() {
        this.status = ClientStatus.SUSPENDED;
    }

    public void blacklist() {
        this.status = ClientStatus.BLACKLISTED;
    }
}
