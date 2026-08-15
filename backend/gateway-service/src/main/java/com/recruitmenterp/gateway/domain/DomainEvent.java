package com.recruitmenterp.gateway.domain;

import lombok.Data;
import java.time.Instant;

@Data
public class DomainEvent<T> {
    private String eventType;
    private String tenantId;
    private Instant timestamp;
    private String version;
    private T payload;
}
