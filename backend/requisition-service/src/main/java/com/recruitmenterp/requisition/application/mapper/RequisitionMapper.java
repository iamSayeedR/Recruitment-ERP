package com.recruitmenterp.requisition.application.mapper;

import com.recruitmenterp.requisition.application.dto.CreateRequisitionRequest;
import com.recruitmenterp.requisition.application.dto.RequisitionResponse;
import com.recruitmenterp.requisition.domain.model.Requisition;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RequisitionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tenantId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "positionsFilled", ignore = true)
    @Mapping(target = "approvedBy", ignore = true)
    @Mapping(target = "approvalDate", ignore = true)
    @Mapping(target = "statusHistory", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Requisition toEntity(CreateRequisitionRequest request);

    RequisitionResponse toResponse(Requisition requisition);

}
