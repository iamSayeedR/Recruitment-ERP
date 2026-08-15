package com.recruitmenterp.common.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import jakarta.persistence.Index;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_tenant_entity", columnList = "tenant_id, entity_type"),
    @Index(name = "idx_audit_tenant_time", columnList = "tenant_id, timestamp")
})
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class AuditLog {
    
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, updatable = false)
    private String tenantId;

    @Column(name = "entity_type", nullable = false, updatable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false, updatable = false)
    private String entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, updatable = false)
    private AuditAction action;

    @Column(name = "field_name", updatable = false)
    private String fieldName;

    @Column(name = "old_value", updatable = false, columnDefinition = "text")
    private String oldValue;

    @Column(name = "new_value", updatable = false, columnDefinition = "text")
    private String newValue;

    @Column(name = "actor_id", updatable = false)
    private String actorId;

    @Column(name = "actor_role", updatable = false)
    private String actorRole;

    @Column(name = "ip_address", updatable = false)
    private String ipAddress;

    @Column(name = "user_agent", updatable = false)
    private String userAgent;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;
}
