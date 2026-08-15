package com.recruitmenterp.compliance.adapter.in.web;

import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpirationAlertDto {
    private UUID candidateApplicationId;
    private String documentType;
    private LocalDate expiryDate;
    private String status;
    private UUID checklistId;
    private UUID itemId;
}
