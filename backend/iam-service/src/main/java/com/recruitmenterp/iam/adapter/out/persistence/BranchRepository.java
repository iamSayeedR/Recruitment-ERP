package com.recruitmenterp.iam.adapter.out.persistence;

import com.recruitmenterp.iam.domain.model.Branch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
    Page<Branch> findAllByTenantId(String tenantId, Pageable pageable);
}
