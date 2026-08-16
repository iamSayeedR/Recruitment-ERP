package com.recruitmenterp.iam.adapter.out.persistence;

import com.recruitmenterp.iam.domain.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByCode(String code);
    Optional<Tenant> findBySubdomain(String subdomain);
    boolean existsByCode(String code);
}
