$BaseDir = "c:\Users\Sayeed Rizwan\OneDrive\Desktop\recruitment-erp\backend\candidate-service"

$Files = @{
    "pom.xml" = @"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.recruitmenterp</groupId>
        <artifactId>recruitment-erp-backend</artifactId>
        <version>0.1.0-SNAPSHOT</version>
    </parent>
    <artifactId>candidate-service</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <dependencies>
        <dependency>
            <groupId>com.recruitmenterp</groupId>
            <artifactId>platform-common</artifactId>
            <version>0.1.0-SNAPSHOT</version>
        </dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-security</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
        <dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>2.5.0</version></dependency>
        <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
        <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
        <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-database-postgresql</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.testcontainers</groupId><artifactId>postgresql</artifactId><scope>test</scope></dependency>
    </dependencies>
</project>
"@
    "src/main/java/com/recruitmenterp/candidate/CandidateServiceApplication.java" = @"
package com.recruitmenterp.candidate;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages = {"com.recruitmenterp.candidate", "com.recruitmenterp.common"})
public class CandidateServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CandidateServiceApplication.class, args);
    }
}
"@
    "src/main/java/com/recruitmenterp/candidate/domain/model/Candidate.java" = @"
package com.recruitmenterp.candidate.domain.model;
import com.recruitmenterp.common.domain.TenantAwareBaseEntity;
import com.recruitmenterp.common.converter.FieldEncryptionConverter;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
@Entity
@Table(name = "candidates")
public class Candidate extends TenantAwareBaseEntity {
    @Column(nullable = false) private String firstName;
    @Column(nullable = false) private String lastName;
    private String nationality;
    private LocalDate dateOfBirth;
    private String email;
    private String phone;
    private String whatsappNumber;
    @Convert(converter = FieldEncryptionConverter.class) private String passportNumber;
    @Convert(converter = FieldEncryptionConverter.class) private String nationalId;
    private LocalDate passportExpiry;
    private String skills;
    private String certifications;
    private String workExperience;
    @Enumerated(EnumType.STRING) private Source source;
    @Enumerated(EnumType.STRING) private CandidateStatus status;
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "candidate_id")
    private List<CandidateDocument> documents = new ArrayList<>();
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
"@
    "src/main/java/com/recruitmenterp/candidate/domain/model/CandidateDocument.java" = @"
package com.recruitmenterp.candidate.domain.model;
import com.recruitmenterp.common.domain.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "candidate_documents")
public class CandidateDocument extends BaseEntity {
    private String fileName;
    private String fileType;
    private String s3Key;
    @Enumerated(EnumType.STRING) private DocumentStatus status;
    private LocalDateTime uploadedAt;
    private String uploadedBy;
}
"@
    "src/main/java/com/recruitmenterp/candidate/domain/model/CandidateApplication.java" = @"
package com.recruitmenterp.candidate.domain.model;
import com.recruitmenterp.common.domain.TenantAwareBaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.UUID;
@Entity
@Table(name = "candidate_applications")
public class CandidateApplication extends TenantAwareBaseEntity {
    private UUID candidateId;
    private UUID requisitionId;
    @Enumerated(EnumType.STRING) private CandidateApplicationStatus status;
    private String interviewNotes;
    private BigDecimal offeredSalary;
    private LocalDate startDate;
    public void transitionTo(CandidateApplicationStatus newStatus, String actor) {
        this.status = newStatus;
    }
}
"@
    "src/main/java/com/recruitmenterp/candidate/domain/model/Source.java" = @"
package com.recruitmenterp.candidate.domain.model;
public enum Source { WALK_IN, REFERRAL, JOB_BOARD, AGENCY_PARTNER }
"@
    "src/main/java/com/recruitmenterp/candidate/domain/model/CandidateStatus.java" = @"
package com.recruitmenterp.candidate.domain.model;
public enum CandidateStatus { REGISTERED, SCREENED, SHORTLISTED, SELECTED, PLACED, REJECTED }
"@
    "src/main/java/com/recruitmenterp/candidate/domain/model/CandidateApplicationStatus.java" = @"
package com.recruitmenterp.candidate.domain.model;
public enum CandidateApplicationStatus { APPLIED, SCREENING, INTERVIEW_SCHEDULED, INTERVIEWED, SHORTLISTED, SELECTED, OFFER_EXTENDED, OFFER_ACCEPTED, REJECTED, WITHDRAWN }
"@
    "src/main/java/com/recruitmenterp/candidate/domain/model/DocumentStatus.java" = @"
package com.recruitmenterp.candidate.domain.model;
public enum DocumentStatus { PENDING_SCAN, CLEAN, INFECTED }
"@
    "src/main/java/com/recruitmenterp/candidate/adapter/out/persistence/CandidateRepository.java" = @"
package com.recruitmenterp.candidate.adapter.out.persistence;
import com.recruitmenterp.candidate.domain.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.UUID;
@Repository
public interface CandidateRepository extends JpaRepository<Candidate, UUID>, JpaSpecificationExecutor<Candidate> {}
"@
    "src/main/java/com/recruitmenterp/candidate/adapter/out/persistence/CandidateApplicationRepository.java" = @"
package com.recruitmenterp.candidate.adapter.out.persistence;
import com.recruitmenterp.candidate.domain.model.CandidateApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.UUID;
@Repository
public interface CandidateApplicationRepository extends JpaRepository<CandidateApplication, UUID>, JpaSpecificationExecutor<CandidateApplication> {}
"@
    "src/main/java/com/recruitmenterp/candidate/adapter/out/persistence/CandidateDocumentRepository.java" = @"
package com.recruitmenterp.candidate.adapter.out.persistence;
import com.recruitmenterp.candidate.domain.model.CandidateDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
@Repository
public interface CandidateDocumentRepository extends JpaRepository<CandidateDocument, UUID> {}
"@
    "src/main/java/com/recruitmenterp/candidate/application/dto/CreateCandidateRequest.java" = @"
package com.recruitmenterp.candidate.application.dto;
import jakarta.validation.constraints.NotBlank;
public class CreateCandidateRequest {
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String email;
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
"@
    "src/main/java/com/recruitmenterp/candidate/application/dto/CandidateResponse.java" = @"
package com.recruitmenterp.candidate.application.dto;
import java.util.UUID;
public class CandidateResponse {
    private UUID id;
    private String firstName;
    private String lastName;
}
"@
    "src/main/java/com/recruitmenterp/candidate/application/dto/CandidateApplicationResponse.java" = @"
package com.recruitmenterp.candidate.application.dto;
import java.util.UUID;
public class CandidateApplicationResponse {
    private UUID id;
    private UUID candidateId;
    private String status;
}
"@
    "src/main/java/com/recruitmenterp/candidate/application/dto/BulkCandidateUploadRequest.java" = @"
package com.recruitmenterp.candidate.application.dto;
public class BulkCandidateUploadRequest {
    private String csvContent;
    public String getCsvContent() { return csvContent; }
    public void setCsvContent(String csvContent) { this.csvContent = csvContent; }
}
"@
    "src/main/java/com/recruitmenterp/candidate/application/mapper/CandidateMapper.java" = @"
package com.recruitmenterp.candidate.application.mapper;
import com.recruitmenterp.candidate.domain.model.Candidate;
import com.recruitmenterp.candidate.application.dto.CreateCandidateRequest;
import com.recruitmenterp.candidate.application.dto.CandidateResponse;
import org.springframework.stereotype.Component;
@Component
public class CandidateMapper {
    public Candidate toEntity(CreateCandidateRequest req) {
        Candidate c = new Candidate();
        c.setFirstName(req.getFirstName());
        c.setLastName(req.getLastName());
        c.setEmail(req.getEmail());
        return c;
    }
    public CandidateResponse toDto(Candidate c) {
        return new CandidateResponse();
    }
}
"@
    "src/main/java/com/recruitmenterp/candidate/application/mapper/CandidateApplicationMapper.java" = @"
package com.recruitmenterp.candidate.application.mapper;
import com.recruitmenterp.candidate.domain.model.CandidateApplication;
import com.recruitmenterp.candidate.application.dto.CandidateApplicationResponse;
import org.springframework.stereotype.Component;
@Component
public class CandidateApplicationMapper {
    public CandidateApplicationResponse toDto(CandidateApplication c) {
        return new CandidateApplicationResponse();
    }
}
"@
    "src/main/java/com/recruitmenterp/candidate/application/service/CandidateService.java" = @"
package com.recruitmenterp.candidate.application.service;
import com.recruitmenterp.candidate.domain.model.*;
import com.recruitmenterp.candidate.adapter.out.persistence.*;
import com.recruitmenterp.candidate.application.dto.*;
import com.recruitmenterp.candidate.application.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
@Service
@Transactional
public class CandidateService {
    private final CandidateRepository candidateRepository;
    private final CandidateApplicationRepository applicationRepository;
    private final CandidateDocumentRepository documentRepository;
    private final CandidateMapper candidateMapper;
    public CandidateService(CandidateRepository candidateRepository, CandidateApplicationRepository applicationRepository,
                            CandidateDocumentRepository documentRepository, CandidateMapper candidateMapper) {
        this.candidateRepository = candidateRepository;
        this.applicationRepository = applicationRepository;
        this.documentRepository = documentRepository;
        this.candidateMapper = candidateMapper;
    }
    public CandidateResponse createCandidate(CreateCandidateRequest request) {
        Candidate candidate = candidateMapper.toEntity(request);
        return candidateMapper.toDto(candidateRepository.save(candidate));
    }
    public CandidateResponse getCandidateById(UUID id) {
        return candidateMapper.toDto(candidateRepository.findById(id).orElseThrow());
    }
    public void bulkUploadCandidates(String csvContent) {
        String[] lines = csvContent.split("\\n");
        for (String line : lines) {
            if (line.trim().isEmpty()) continue;
            String[] parts = line.split(",");
            Candidate c = new Candidate();
            c.setFirstName(parts[0]);
            c.setLastName(parts.length > 1 ? parts[1] : "");
            c.setEmail(parts.length > 2 ? parts[2] : "");
            candidateRepository.save(c);
        }
    }
    public void transitionApplicationStatus(UUID applicationId, CandidateApplicationStatus newStatus) {
        CandidateApplication app = applicationRepository.findById(applicationId).orElseThrow();
        app.transitionTo(newStatus, "SYSTEM");
        applicationRepository.save(app);
    }
    public String generatePresignedUploadUrl(UUID candidateId, String fileName, String contentType) {
        return "https://s3.mock.url/" + candidateId + "/" + fileName;
    }
    public void scanDocument(UUID documentId) {}
}
"@
    "src/main/java/com/recruitmenterp/candidate/adapter/in/rest/CandidateController.java" = @"
package com.recruitmenterp.candidate.adapter.in.rest;
import com.recruitmenterp.candidate.application.service.CandidateService;
import com.recruitmenterp.candidate.application.dto.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import java.util.UUID;
@RestController
@RequestMapping("/api/v1/candidates")
public class CandidateController {
    private final CandidateService candidateService;
    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }
    @PostMapping
    @PreAuthorize("hasAnyAuthority('RECRUITER', 'COMPLIANCE_OFFICER')")
    public CandidateResponse createCandidate(@Valid @RequestBody CreateCandidateRequest request) {
        return candidateService.createCandidate(request);
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('RECRUITER', 'COMPLIANCE_OFFICER')")
    public CandidateResponse getCandidate(@PathVariable UUID id) {
        return candidateService.getCandidateById(id);
    }
    @PostMapping("/bulk-upload")
    @PreAuthorize("hasAuthority('RECRUITER')")
    public void bulkUpload(@RequestBody BulkCandidateUploadRequest request) {
        candidateService.bulkUploadCandidates(request.getCsvContent());
    }
}
"@
    "src/main/resources/application.yml" = @"
server:
  port: 8083
spring:
  application:
    name: candidate-service
  datasource:
    url: jdbc:postgresql://`${DB_HOST:localhost}`:`${DB_PORT:5432}`/`${DB_NAME:candidate_db}`
    username: `${DB_USER:app_user}`
    password: `${DB_PASSWORD:password}`
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
    baseline-on-migrate: true
    schemas: candidate_schema
"@
    "src/main/resources/application-dev.yml" = @"
server:
  port: 8083
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/candidate_db
    username: app_user
    password: password
"@
    "src/main/resources/db/migration/V1__create_candidate_tables.sql" = @"
CREATE TABLE candidates (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    nationality VARCHAR(100),
    date_of_birth DATE,
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp_number VARCHAR(50),
    passport_number VARCHAR(255),
    national_id VARCHAR(255),
    passport_expiry DATE,
    skills TEXT,
    certifications TEXT,
    work_experience TEXT,
    source VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
CREATE TABLE candidate_documents (
    id UUID PRIMARY KEY,
    candidate_id UUID REFERENCES candidates(id),
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    s3_key VARCHAR(500),
    status VARCHAR(50),
    uploaded_at TIMESTAMP,
    uploaded_by VARCHAR(100)
);
CREATE TABLE candidate_applications (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    candidate_id UUID NOT NULL,
    requisition_id UUID NOT NULL,
    status VARCHAR(50),
    interview_notes TEXT,
    offered_salary DECIMAL(10,2),
    start_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy ON candidates
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
ALTER TABLE candidate_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_policy_apps ON candidate_applications
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
"@
    "src/test/java/com/recruitmenterp/candidate/CandidateServiceTest.java" = @"
package com.recruitmenterp.candidate;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
@SpringBootTest
class CandidateServiceTest {
    @Test
    void contextLoads() {}
}
"@
    "src/test/java/com/recruitmenterp/candidate/CandidateControllerIT.java" = @"
package com.recruitmenterp.candidate;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.junit.jupiter.Testcontainers;
@SpringBootTest
@Testcontainers
class CandidateControllerIT {
    @Test
    void testEndpoints() {}
}
"@
}

foreach ($File in $Files.GetEnumerator()) {
    $FilePath = Join-Path $BaseDir $File.Name
    $DirPath = Split-Path $FilePath
    if (-not (Test-Path $DirPath)) {
        New-Item -ItemType Directory -Force -Path $DirPath | Out-Null
    }
    Set-Content -Path $FilePath -Value $File.Value -Encoding UTF8
}
Write-Output "All files generated."
