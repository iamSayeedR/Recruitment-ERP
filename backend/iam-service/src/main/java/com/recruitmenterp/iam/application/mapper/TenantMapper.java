package com.recruitmenterp.iam.application.mapper;

import com.recruitmenterp.iam.application.dto.CreateTenantRequest;
import com.recruitmenterp.iam.application.dto.TenantBrandingResponse;
import com.recruitmenterp.iam.application.dto.TenantResponse;
import com.recruitmenterp.iam.domain.model.Tenant;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TenantMapper {
    Tenant toEntity(CreateTenantRequest request);
    TenantResponse toResponse(Tenant tenant);
    TenantBrandingResponse toBrandingResponse(Tenant tenant);
}
