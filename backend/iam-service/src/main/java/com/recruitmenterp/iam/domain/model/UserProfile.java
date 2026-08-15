package com.recruitmenterp.iam.domain.model;

import com.recruitmenterp.common.multitenancy.TenantAwareBaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a user profile in the system.
 */
@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile extends TenantAwareBaseEntity {

    @Column(nullable = false, unique = true)
    private String keycloakUserId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
}
