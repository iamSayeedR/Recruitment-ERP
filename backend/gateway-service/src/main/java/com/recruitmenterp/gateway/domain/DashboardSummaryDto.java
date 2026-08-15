package com.recruitmenterp.gateway.domain;

import lombok.Data;
import java.util.Map;

@Data
public class DashboardSummaryDto {
    private Map<String, Integer> requisitions;
    private Map<String, Integer> candidates;
    private Map<String, Integer> compliance;
}
