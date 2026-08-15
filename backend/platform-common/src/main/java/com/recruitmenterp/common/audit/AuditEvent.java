package com.recruitmenterp.common.audit;

import java.time.Instant;
import java.util.List;

public record AuditEvent(
    String tenantId,
    String entityType,
    String entityId,
    AuditAction action,
    List<FieldChange> changes,
    String actorId,
    String actorRole,
    String ipAddress,
    Instant timestamp
) {
    public record FieldChange(String fieldName, String oldValue, String newValue) {}
}
