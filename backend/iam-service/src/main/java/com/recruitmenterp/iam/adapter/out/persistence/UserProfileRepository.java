package com.recruitmenterp.iam.adapter.out.persistence;

import com.recruitmenterp.iam.domain.model.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByKeycloakUserId(String keycloakUserId);
    List<UserProfile> findAllByTenantId(String tenantId);
    boolean existsByKeycloakUserId(String keycloakUserId);
}
