package com.recruitmenterp.candidate.application.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record CreateCandidateRequest(
    @NotBlank(message = "First name is required") String firstName,
    @NotBlank(message = "Last name is required") String lastName,
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
    String source
) {}
