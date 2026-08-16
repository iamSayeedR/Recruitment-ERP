package com.recruitmenterp.requisition.adapter.out.persistence;

import com.recruitmenterp.requisition.domain.model.Requisition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RequisitionRepository extends JpaRepository<Requisition, UUID>, JpaSpecificationExecutor<Requisition> {
}
