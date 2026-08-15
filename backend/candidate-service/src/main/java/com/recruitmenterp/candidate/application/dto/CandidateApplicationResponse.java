package com.recruitmenterp.candidate.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CandidateApplicationResponse(
    UUID id,
    UUID candidateId,
    UUID requisitionId,
    String status,
    String interviewNotes,
    BigDecimal offeredSalary,
    LocalDate startDate
) {}
