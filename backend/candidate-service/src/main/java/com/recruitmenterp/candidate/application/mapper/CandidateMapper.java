package com.recruitmenterp.candidate.application.mapper;

import com.recruitmenterp.candidate.domain.model.Candidate;
import com.recruitmenterp.candidate.application.dto.CreateCandidateRequest;
import com.recruitmenterp.candidate.application.dto.CandidateResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CandidateMapper {
    Candidate toEntity(CreateCandidateRequest request);
    CandidateResponse toDto(Candidate candidate);
}
