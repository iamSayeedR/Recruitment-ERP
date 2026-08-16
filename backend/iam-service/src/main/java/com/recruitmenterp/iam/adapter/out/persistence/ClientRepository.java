package com.recruitmenterp.iam.adapter.out.persistence;

import com.recruitmenterp.iam.domain.model.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {
    List<Client> findAllByTenantId(String tenantId);
    boolean existsByNameAndTenantId(String name, String tenantId);
}
