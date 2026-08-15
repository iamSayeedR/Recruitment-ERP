package com.recruitmenterp.common.audit;

import com.recruitmenterp.common.multitenancy.TenantContext;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreRemove;
import jakarta.persistence.PreUpdate;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AuditableEntityListener {

    private AuditEventPublisher publisher;
    private TenantContext tenantContext;

    @Autowired
    public void setDependencies(@Lazy AuditEventPublisher publisher, ObjectProvider<TenantContext> tenantContextProvider) {
        this.publisher = publisher;
        this.tenantContext = tenantContextProvider.getIfAvailable();
    }

    @PrePersist
    public void prePersist(Object entity) {
        publishEvent(entity, AuditAction.CREATE, extractFields(entity));
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        // Full diff logic requires Hibernate SPI or Envers. For simplistic entity listener:
        publishEvent(entity, AuditAction.UPDATE, List.of());
    }

    @PreRemove
    public void preRemove(Object entity) {
        publishEvent(entity, AuditAction.DELETE, List.of());
    }

    private void publishEvent(Object entity, AuditAction action, List<AuditEvent.FieldChange> changes) {
        if (publisher == null) return;
        
        String tenantId = tenantContext != null ? tenantContext.getTenantId() : "system";
        String userId = tenantContext != null ? tenantContext.getUserId() : "system";
        
        AuditEvent event = new AuditEvent(
            tenantId,
            Hibernate.unproxy(entity).getClass().getSimpleName(),
            extractId(entity),
            action,
            changes,
            userId,
            "USER", // To be extracted from context
            "0.0.0.0", // To be extracted from context
            Instant.now()
        );
        publisher.publish(event);
    }
    
    private String extractId(Object entity) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            Object id = idField.get(entity);
            return id != null ? id.toString() : "unknown";
        } catch (Exception e) {
            return "unknown";
        }
    }
    
    private List<AuditEvent.FieldChange> extractFields(Object entity) {
        return List.of(); // Placeholder for initial field values
    }
}
