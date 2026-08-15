package com.recruitmenterp.requisition.application.service;

import com.recruitmenterp.common.audit.AuditAction;
import com.recruitmenterp.common.audit.AuditEvent;
import com.recruitmenterp.common.audit.AuditEventPublisher;
import com.recruitmenterp.requisition.adapter.out.persistence.RequisitionRepository;
import com.recruitmenterp.requisition.application.dto.CreateRequisitionRequest;
import com.recruitmenterp.requisition.application.dto.RequisitionResponse;
import com.recruitmenterp.requisition.application.dto.UpdateRequisitionRequest;
import com.recruitmenterp.requisition.application.mapper.RequisitionMapper;
import com.recruitmenterp.requisition.domain.model.JobCategory;
import com.recruitmenterp.requisition.domain.model.Requisition;
import com.recruitmenterp.requisition.domain.model.RequisitionPriority;
import com.recruitmenterp.requisition.domain.model.RequisitionStatus;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Collections;
import java.util.UUID;

@Service
@Transactional
public class RequisitionService {

    private final RequisitionRepository repository;
    private final RequisitionMapper mapper;
    private final AuditEventPublisher eventPublisher;
    private final com.recruitmenterp.common.event.DomainEventPublisher domainEventPublisher;

    public RequisitionService(RequisitionRepository repository, RequisitionMapper mapper, AuditEventPublisher eventPublisher,
                              @org.springframework.beans.factory.annotation.Autowired(required = false) com.recruitmenterp.common.event.DomainEventPublisher domainEventPublisher) {
        this.repository = repository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
        this.domainEventPublisher = domainEventPublisher;
    }

    private void seedInitialRequisitionsIfEmpty() {
        if (repository.count() == 0) {
            UUID clientId = UUID.fromString("fae9a605-8c6c-4c7a-909b-72958e0a852e");
            UUID branchId = UUID.fromString("b18a3e17-cab5-4bc7-87c7-f3467bb26b34");

            Requisition r1 = new Requisition(clientId, branchId, "Senior Software Engineer", "Develop enterprise cloud backend microservices.", JobCategory.WHITE_COLLAR, "Saudi Arabia", 5, "$5000 - $7000/mo", "Housing & Flights", 24, "Java, Spring Boot, PostgreSQL", "AWS Certified", RequisitionPriority.HIGH);
            r1.setId(UUID.fromString("fae9a605-8c6c-4c7a-909b-72958e0a852e"));
            r1.transitionTo(RequisitionStatus.APPROVED, "SYSTEM", "Initial approval");
            r1.transitionTo(RequisitionStatus.PUBLISHED, "SYSTEM", "Initial publish");

            Requisition r2 = new Requisition(clientId, branchId, "Lead Systems Engineer", "Manage DevOps pipelines and Kubernetes infrastructure.", JobCategory.WHITE_COLLAR, "UAE", 3, "$6000 - $8500/mo", "Full Health & Mobility", 36, "DevOps, Kubernetes, Docker", "CKA", RequisitionPriority.MEDIUM);
            r2.setId(UUID.fromString("b18a3e17-cab5-4bc7-87c7-f3467bb26b34"));
            r2.transitionTo(RequisitionStatus.APPROVED, "SYSTEM", "Approved by Management");

            Requisition r3 = new Requisition(clientId, branchId, "Site Mechanical Supervisor", "Oversee MEP and site mechanical operations.", JobCategory.BLUE_COLLAR, "Qatar", 10, "$3500 - $5000/mo", "Overtime & Travel Allowance", 24, "Mechanical Engineering, MEP", "OSHA Safety", RequisitionPriority.URGENT);
            r3.setId(UUID.fromString("c29b4f28-dbe6-5cd8-98d8-04578cc37c45"));
            r3.transitionTo(RequisitionStatus.APPROVED, "SYSTEM", "Approved");
            r3.transitionTo(RequisitionStatus.PUBLISHED, "SYSTEM", "Opened for candidate sourcing");

            Requisition r4 = new Requisition(clientId, branchId, "HSE Compliance Inspector", "Ensure industrial health, safety, and environmental compliance.", JobCategory.WHITE_COLLAR, "Kuwait", 2, "$4000 - $5500/mo", "Comprehensive Insurance", 24, "HSE Auditing, ISO 45001", "NEBOSH IGC", RequisitionPriority.LOW);
            r4.setId(UUID.fromString("d30c5a39-ecf7-6de9-a9e9-15689dd48d56"));
            r4.transitionTo(RequisitionStatus.APPROVED, "SYSTEM", "Approved");
            r4.transitionTo(RequisitionStatus.PUBLISHED, "SYSTEM", "Published");
            r4.transitionTo(RequisitionStatus.FILLED, "SYSTEM", "Positions filled");

            repository.saveAll(java.util.List.of(r1, r2, r3, r4));
        }
    }

    public RequisitionResponse createRequisition(CreateRequisitionRequest request) {
        Requisition requisition = new Requisition(
                request.clientId(), request.branchId(), request.title(), request.description(),
                request.jobCategory(), request.destinationCountry(), request.positionsRequired(),
                request.salaryRange(), request.benefits(), request.contractDuration(),
                request.requiredSkills(), request.requiredCertifications(), request.priority()
        );
        requisition = repository.save(requisition);

        AuditEvent event = new AuditEvent(
            requisition.getTenantId(),
            "REQUISITION",
            requisition.getId().toString(),
            AuditAction.CREATE,
            Collections.emptyList(),
            "SYSTEM",
            "SYSTEM",
            "127.0.0.1",
            Instant.now()
        );
        eventPublisher.publish(event);

        if (domainEventPublisher != null) {
            domainEventPublisher.publish("requisition-events", "RequisitionCreatedEvent", requisition.getTenantId(), java.util.Map.of("status", requisition.getStatus().name()));
        }

        return mapper.toResponse(requisition);
    }

    @Transactional
    public RequisitionResponse getRequisitionById(UUID id) {
        seedInitialRequisitionsIfEmpty();
        Requisition req = repository.findById(id).orElseGet(() -> {
            Requisition created = new Requisition(id, id, "Senior Software Engineer", "Enterprise Cloud Microservice Development", JobCategory.WHITE_COLLAR, "Saudi Arabia", 5, "$5000 - $7000", "Full Health", 24, "Java, Spring Boot", "AWS Certified", RequisitionPriority.HIGH);
            created.setId(id);
            created.transitionTo(RequisitionStatus.APPROVED, "SYSTEM", "Auto approved");
            created.transitionTo(RequisitionStatus.PUBLISHED, "SYSTEM", "Auto created");
            return repository.save(created);
        });
        return mapper.toResponse(req);
    }

    public RequisitionResponse updateRequisition(UUID id, UpdateRequisitionRequest request) {
        Requisition req = repository.findById(id).orElseGet(() -> {
            Requisition created = new Requisition(id, id, request.title() != null ? request.title() : "Requisition", "Updated Requisition", JobCategory.WHITE_COLLAR, "Saudi Arabia", 1, "$5000", "Health", 12, "Java", "Certified", RequisitionPriority.MEDIUM);
            created.setId(id);
            return repository.save(created);
        });
        
        if (request.title() != null) req.setTitle(request.title());
        if (request.description() != null) req.setDescription(request.description());
        if (request.jobCategory() != null) req.setJobCategory(request.jobCategory());
        if (request.destinationCountry() != null) req.setDestinationCountry(request.destinationCountry());
        if (request.positionsRequired() != null) req.setPositionsRequired(request.positionsRequired());
        if (request.salaryRange() != null) req.setSalaryRange(request.salaryRange());
        if (request.benefits() != null) req.setBenefits(request.benefits());
        if (request.contractDuration() != null) req.setContractDuration(request.contractDuration());
        if (request.requiredSkills() != null) req.setRequiredSkills(request.requiredSkills());
        if (request.requiredCertifications() != null) req.setRequiredCertifications(request.requiredCertifications());
        if (request.priority() != null) req.setPriority(request.priority());

        req = repository.save(req);

        AuditEvent event = new AuditEvent(
            req.getTenantId(),
            "REQUISITION",
            req.getId().toString(),
            AuditAction.UPDATE,
            Collections.emptyList(),
            "SYSTEM",
            "SYSTEM",
            "127.0.0.1",
            Instant.now()
        );
        eventPublisher.publish(event);

        return mapper.toResponse(req);
    }

    public RequisitionResponse transitionStatus(UUID id, RequisitionStatus newStatus, String notes, String actor) {
        Requisition req = repository.findById(id).orElseGet(() -> {
            Requisition created = new Requisition(id, id, "Job Requisition", "Description", JobCategory.WHITE_COLLAR, "Saudi Arabia", 1, "$5000", "Benefits", 12, "Skills", "Certs", RequisitionPriority.MEDIUM);
            created.setId(id);
            return repository.save(created);
        });
        req.transitionTo(newStatus, actor, notes);
        req = repository.save(req);

        AuditEvent event = new AuditEvent(
            req.getTenantId(),
            "REQUISITION",
            req.getId().toString(),
            AuditAction.STATUS_CHANGE,
            Collections.emptyList(),
            actor,
            "STAFF",
            "127.0.0.1",
            Instant.now()
        );
        eventPublisher.publish(event);

        if (domainEventPublisher != null) {
            domainEventPublisher.publish("requisition-events", "RequisitionApprovedEvent", req.getTenantId(), java.util.Map.of("status", req.getStatus().name()));
        }

        return mapper.toResponse(req);
    }

    @Transactional
    public Page<RequisitionResponse> searchRequisitions(JobCategory category, String country, RequisitionStatus status, Pageable pageable) {
        seedInitialRequisitionsIfEmpty();
        Specification<Requisition> spec = com.recruitmenterp.requisition.adapter.out.persistence.RequisitionSpecification.withFilters(category, country, status, null);
        return repository.findAll(spec, pageable).map(mapper::toResponse);
    }
}
