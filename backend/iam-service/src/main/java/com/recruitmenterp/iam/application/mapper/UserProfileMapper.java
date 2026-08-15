package com.recruitmenterp.iam.application.mapper;

import com.recruitmenterp.iam.application.dto.CreateUserRequest;
import com.recruitmenterp.iam.application.dto.UserProfileResponse;
import com.recruitmenterp.iam.domain.model.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserProfileMapper {
    @Mapping(target = "status", constant = "ACTIVE")
    UserProfile toEntity(CreateUserRequest request);

    @Mapping(source = "branch.id", target = "branchId")
    UserProfileResponse toResponse(UserProfile userProfile);
}
