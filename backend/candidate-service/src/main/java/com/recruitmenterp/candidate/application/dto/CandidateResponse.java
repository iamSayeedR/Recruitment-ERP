package com.recruitmenterp.candidate.application.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CandidateResponse(
    UUID id,
    String firstName,
    String lastName,
    String nationality,
    LocalDate dateOfBirth,
    String email,
    String phone,
    String whatsappNumber,
    String passportNumber,
    String nationalId,
    LocalDate passportExpiry,
    String skills,
    String certifications,
    String workExperience,
    String source,
    String status
) {}
