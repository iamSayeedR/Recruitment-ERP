package com.recruitmenterp.common.multitenancy;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Base repository interface for tenant-aware entities.
 *
 * @param <T> the entity type
 */
@NoRepositoryBean
public interface TenantAwareJpaRepository<T extends TenantAwareBaseEntity> extends JpaRepository<T, UUID>, JpaSpecificationExecutor<T> {
}
