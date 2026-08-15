package com.recruitmenterp.candidate.application.dto;

import java.util.List;

public record BulkCandidateUploadRequest(
        String csvContent,
        List<CreateCandidateRequest> candidates
) {}
