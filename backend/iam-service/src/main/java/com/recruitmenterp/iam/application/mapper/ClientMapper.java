package com.recruitmenterp.iam.application.mapper;

import com.recruitmenterp.iam.application.dto.ClientResponse;
import com.recruitmenterp.iam.application.dto.CreateClientRequest;
import com.recruitmenterp.iam.domain.model.Client;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClientMapper {
    @Mapping(target = "status", constant = "ACTIVE")
    Client toEntity(CreateClientRequest request);
    ClientResponse toResponse(Client client);
}
