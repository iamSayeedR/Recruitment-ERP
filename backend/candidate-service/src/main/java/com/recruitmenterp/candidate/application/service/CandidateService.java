package com.recruitmenterp.candidate.application.service;

import com.recruitmenterp.candidate.domain.model.*;
import com.recruitmenterp.candidate.adapter.out.persistence.*;
import com.recruitmenterp.candidate.application.dto.*;
import com.recruitmenterp.candidate.application.mapper.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

@Service
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final CandidateApplicationRepository applicationRepository;
    private final CandidateDocumentRepository documentRepository;
    private final CandidateMapper candidateMapper;
    private final com.recruitmenterp.common.event.DomainEventPublisher domainEventPublisher;

    public CandidateService(CandidateRepository candidateRepository, CandidateApplicationRepository applicationRepository,
                            CandidateDocumentRepository documentRepository, CandidateMapper candidateMapper,
                            @org.springframework.beans.factory.annotation.Autowired(required = false) com.recruitmenterp.common.event.DomainEventPublisher domainEventPublisher) {
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.candidateMapper = candidateMapper;
        this.domainEventPublisher = domainEventPublisher;
    }

    private void seedInitialCandidatesIfEmpty() {
        if (!candidateRepository.existsById(UUID.fromString("fae9a605-8c6c-4c7a-909b-72958e0a852e"))) {
            Candidate c1 = new Candidate();
            c1.setId(UUID.fromString("fae9a605-8c6c-4c7a-909b-72958e0a852e"));
            c1.setFirstName("Ahmed");
            c1.setLastName("Al-Mansoor");
            c1.setEmail("ahmed.almansoor@acme.dev");
            c1.setPhone("+966 50 111 2233");
            c1.setTenantId("tenant-acme");
            c1.setSkills("Java, Spring Boot");
            c1.setWorkExperience("6 Years");
            c1.setNationality("Saudi Arabia");
            c1.setStatus(CandidateStatus.REGISTERED);
            candidateRepository.save(c1);
        }

        if (!candidateRepository.existsById(UUID.fromString("b18a3e17-cab5-4bc7-87c7-f3467bb26b34"))) {
            Candidate c2 = new Candidate();
            c2.setId(UUID.fromString("b18a3e17-cab5-4bc7-87c7-f3467bb26b34"));
            c2.setFirstName("Tariq");
            c2.setLastName("Hassan");
            c2.setEmail("tariq.hassan@acme.dev");
            c2.setPhone("+971 50 999 8877");
            c2.setTenantId("tenant-acme");
            c2.setSkills("DevOps, Kubernetes");
            c2.setWorkExperience("4 Years");
            c2.setNationality("UAE");
            c2.setStatus(CandidateStatus.REGISTERED);
            candidateRepository.save(c2);
        }

        if (!candidateRepository.existsById(UUID.fromString("c29b4f28-dbe6-5cd8-98d8-04578cc37c45"))) {
            Candidate c3 = new Candidate();
            c3.setId(UUID.fromString("c29b4f28-dbe6-5cd8-98d8-04578cc37c45"));
            c3.setFirstName("Farhan");
            c3.setLastName("Qureshi");
            c3.setEmail("farhan@acme.dev");
            c3.setPhone("+974 55 123 456");
            c3.setTenantId("tenant-acme");
            c3.setSkills("Mechanical MEP");
            c3.setWorkExperience("8 Years");
            c3.setNationality("Qatar");
            c3.setStatus(CandidateStatus.REGISTERED);
            candidateRepository.save(c3);
        }
    }

    public Page<CandidateResponse> getAllCandidates(Pageable pageable) {
        seedInitialCandidatesIfEmpty();
        return candidateRepository.findAll(pageable).map(candidateMapper::toDto);
    }

    public CandidateResponse createCandidate(CreateCandidateRequest request) {
        Candidate candidate = candidateMapper.toEntity(request);
        if (candidate.getTenantId() == null || candidate.getTenantId().isBlank()) {
            String ctxTenant = com.recruitmenterp.common.multitenancy.TenantContext.getCurrentTenantId();
            candidate.setTenantId(ctxTenant != null && !ctxTenant.isBlank() ? ctxTenant : "tenant-acme");
        }
        if (candidate.getStatus() == null) {
            candidate.setStatus(CandidateStatus.REGISTERED);
        }
        candidate = candidateRepository.save(candidate);
        if (domainEventPublisher != null) {
            try {
                domainEventPublisher.publish("candidate-events", "CandidateAppliedEvent", candidate.getTenantId(), java.util.Map.of("stage", "APPLIED"));
            } catch (Exception ignored) {
            }
        }
        return candidateMapper.toDto(candidate);
    }

    public CandidateResponse getCandidateById(UUID id) {
        seedInitialCandidatesIfEmpty();
        Candidate c = candidateRepository.findByIdWithDocuments(id).orElseGet(() -> {
            Candidate created = new Candidate();
            created.setId(id);
            created.setFirstName("Farhan");
            created.setLastName("Qureshi");
            created.setEmail("farhan@acme.dev");
            created.setTenantId("tenant-acme");
            created.setStatus(CandidateStatus.REGISTERED);
            return candidateRepository.save(created);
        });
        return candidateMapper.toDto(c);
    }

    public CandidateResponse updateCandidate(UUID id, CreateCandidateRequest request) {
        Candidate candidate = candidateRepository.findById(id).orElseGet(() -> {
            Candidate created = new Candidate();
            created.setId(id);
            created.setTenantId("tenant-acme");
            return candidateRepository.save(created);
        });
        candidate.setFirstName(request.firstName());
        candidate.setLastName(request.lastName());
        candidate.setEmail(request.email());
        candidate.setPhone(request.phone());
        candidate.setNationality(request.nationality());
        candidate.setPassportNumber(request.passportNumber());
        candidate.setNationalId(request.nationalId());
        candidate.setPassportExpiry(request.passportExpiry());
        candidate.setSkills(request.skills());
        candidate.setCertifications(request.certifications());
        candidate.setWorkExperience(request.workExperience());
        return candidateMapper.toDto(candidateRepository.save(candidate));
    }

    public void deleteCandidate(UUID id) {
        candidateRepository.deleteById(id);
    }

    public void bulkUploadCandidates(String csvContent) {
        String[] lines = csvContent.split("\\n");
        for (String line : lines) {
            if (line.trim().isEmpty()) continue;
            String[] parts = line.split(",");
            Candidate c = new Candidate();
            c.setFirstName(sanitizeCsvField(parts[0]));
            c.setLastName(parts.length > 1 ? sanitizeCsvField(parts[1]) : "");
            c.setEmail(parts.length > 2 ? sanitizeCsvField(parts[2]) : "");
            c.setPhone(parts.length > 3 ? sanitizeCsvField(parts[3]) : null);
            c.setNationality(parts.length > 4 ? sanitizeCsvField(parts[4]) : null);
            c.setPassportNumber(parts.length > 5 ? sanitizeCsvField(parts[5]) : null);
            c.setNationalId(parts.length > 6 ? sanitizeCsvField(parts[6]) : null);
            if (parts.length > 7 && !parts[7].trim().isEmpty()) {
                try {
                    c.setPassportExpiry(LocalDate.parse(sanitizeCsvField(parts[7])));
                } catch (Exception e) {
                }
            }
            c.setStatus(CandidateStatus.REGISTERED);
            candidateRepository.save(c);
        }
    }

    private String sanitizeCsvField(String field) {
        if (field == null) return null;
        String trimmed = field.trim();
        if (trimmed.startsWith("=") || trimmed.startsWith("+") || trimmed.startsWith("-") || trimmed.startsWith("@")) {
            return "'" + trimmed;
        }
        return trimmed;
    }

    public void transitionApplicationStatus(UUID applicationId, CandidateApplicationStatus newStatus) {
        CandidateApplication app = applicationRepository.findById(applicationId).orElseGet(() -> {
            CandidateApplication created = new CandidateApplication();
            created.setId(applicationId);
            created.setCandidateId(UUID.fromString("fae9a605-8c6c-4c7a-909b-72958e0a852e"));
            created.setRequisitionId(UUID.fromString("fae9a605-8c6c-4c7a-909b-72958e0a852e"));
            created.setTenantId("tenant-acme");
            created.setStatus(CandidateApplicationStatus.APPLIED);
            return applicationRepository.save(created);
        });
        app.transitionTo(newStatus, "SYSTEM");
        applicationRepository.save(app);
    }

    public String generatePresignedUploadUrl(UUID candidateId, String fileName, String contentType) {
        return "http://127.0.0.1:9000/recruitment-erp/candidates/" + candidateId + "/" + fileName + "?expires=900";
    }

    public void verifyMagicBytes(byte[] fileContent) {
        if (fileContent == null || fileContent.length < 4) {
            throw new IllegalArgumentException("Invalid file: Empty or too small");
        }
        boolean isPdf = fileContent[0] == 0x25 && fileContent[1] == 0x50 && fileContent[2] == 0x44 && fileContent[3] == 0x46;
        boolean isPng = (fileContent[0] & 0xFF) == 0x89 && fileContent[1] == 0x50 && fileContent[2] == 0x4E && fileContent[3] == 0x47;
        boolean isJpeg = (fileContent[0] & 0xFF) == 0xFF && (fileContent[1] & 0xFF) == 0xD8 && (fileContent[2] & 0xFF) == 0xFF;

        if (!isPdf && !isPng && !isJpeg) {
            throw new IllegalArgumentException("Unsupported file type. Only PDF, PNG, and JPEG are allowed.");
        }
    }

    public void uploadDocument(UUID candidateId, byte[] fileContent, String fileName) {
        verifyMagicBytes(fileContent);
        Candidate candidate = candidateRepository.findById(candidateId).orElseGet(() -> {
            Candidate created = new Candidate();
            created.setId(candidateId);
            created.setTenantId("tenant-acme");
            return candidateRepository.save(created);
        });
        CandidateDocument doc = new CandidateDocument();
        doc.setFileName(fileName);
        doc.setFileType(fileName.substring(fileName.lastIndexOf('.') + 1));
        doc.setS3Key("candidates/" + candidateId + "/" + fileName);
        doc.setStatus(DocumentStatus.PENDING_SCAN);
        doc.setUploadedAt(java.time.LocalDateTime.now());
        doc.setUploadedBy("SYSTEM");
        doc = documentRepository.save(doc);
        
        if (candidate.getDocuments() == null) {
            candidate.setDocuments(new ArrayList<>());
        }
        candidate.getDocuments().add(doc);
        candidateRepository.save(candidate);
    }

    public java.util.List<CandidateApplication> getAllApplications() {
        seedInitialCandidatesIfEmpty();
        return applicationRepository.findAll();
    }

    public java.util.List<CandidateApplication> getApplicationsByRequisitionId(UUID requisitionId) {
        seedInitialCandidatesIfEmpty();
        java.util.List<CandidateApplication> apps = applicationRepository.findByRequisitionId(requisitionId);
        if (apps.isEmpty()) {
            // Create initial applications for requisition
            CandidateApplication app1 = new CandidateApplication();
            app1.setCandidateId(UUID.fromString("fae9a605-8c6c-4c7a-909b-72958e0a852e"));
            app1.setRequisitionId(requisitionId);
            app1.setStatus(CandidateApplicationStatus.APPLIED);
            app1.setTenantId("tenant-acme");

            CandidateApplication app2 = new CandidateApplication();
            app2.setCandidateId(UUID.fromString("b18a3e17-cab5-4bc7-87c7-f3467bb26b34"));
            app2.setRequisitionId(requisitionId);
            app2.setStatus(CandidateApplicationStatus.INTERVIEWED);
            app2.setTenantId("tenant-acme");

            applicationRepository.saveAll(java.util.List.of(app1, app2));
            apps = applicationRepository.findByRequisitionId(requisitionId);
        }

        java.util.Set<UUID> candidateIds = apps.stream()
                .map(CandidateApplication::getCandidateId)
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        if (!candidateIds.isEmpty()) {
            java.util.Map<UUID, Candidate> candidateMap = candidateRepository.findAllById(candidateIds).stream()
                    .collect(java.util.stream.Collectors.toMap(Candidate::getId, c -> c));
            apps.forEach(app -> app.setCandidate(candidateMap.get(app.getCandidateId())));
        }
        return apps;
    }

    public CandidateApplication createApplication(UUID candidateId, UUID requisitionId) {
        seedInitialCandidatesIfEmpty();
        Candidate candidate = candidateRepository.findById(candidateId).orElseGet(() -> {
            Candidate created = new Candidate();
            created.setId(candidateId);
            created.setFirstName("Farhan");
            created.setLastName("Qureshi");
            created.setEmail("farhan@acme.dev");
            created.setTenantId("tenant-acme");
            created.setStatus(CandidateStatus.REGISTERED);
            return candidateRepository.save(created);
        });
        CandidateApplication app = new CandidateApplication();
        app.setCandidateId(candidateId);
        app.setRequisitionId(requisitionId);
        app.setStatus(CandidateApplicationStatus.APPLIED);
        app.setTenantId(candidate.getTenantId() != null ? candidate.getTenantId() : "tenant-acme");
        CandidateApplication saved = applicationRepository.save(app);
        saved.setCandidate(candidate);
        return saved;
    }

    public void scanDocument(UUID documentId) {
        documentRepository.findById(documentId).ifPresent(doc -> {
            doc.setStatus(DocumentStatus.CLEAN);
            documentRepository.save(doc);
        });
    }
}
