package com.recruitmenterp.candidate.application.mapper;

import com.recruitmenterp.candidate.domain.model.CandidateApplication;
import com.recruitmenterp.candidate.application.dto.CandidateApplicationResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CandidateApplicationMapper {
    CandidateApplicationResponse toDto(CandidateApplication application);
}
