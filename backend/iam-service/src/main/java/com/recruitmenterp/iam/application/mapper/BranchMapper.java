package com.recruitmenterp.iam.application.mapper;

import com.recruitmenterp.iam.application.dto.BranchResponse;
import com.recruitmenterp.iam.application.dto.CreateBranchRequest;
import com.recruitmenterp.iam.domain.model.Branch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BranchMapper {
    @Mapping(target = "status", constant = "ACTIVE")
    Branch toEntity(CreateBranchRequest request);
    BranchResponse toResponse(Branch branch);
}
