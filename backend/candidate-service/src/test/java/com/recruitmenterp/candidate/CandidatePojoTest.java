package com.recruitmenterp.candidate;

import static org.junit.jupiter.api.Assertions.*;

import com.recruitmenterp.candidate.domain.model.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.UUID;

class CandidatePojoTest {

    @Test
    void testCandidatePojo() {
        Candidate candidate = new Candidate();
        candidate.setFirstName("John");
        candidate.setLastName("Doe");
        candidate.setNationality("Indian");
        candidate.setDateOfBirth(LocalDate.of(1995, 1, 1));
        candidate.setEmail("john.doe@example.com");
        candidate.setPhone("+123456789");
        candidate.setWhatsappNumber("+123456789");
        candidate.setPassportNumber("P123456");
        candidate.setNationalId("N987654");
        candidate.setPassportExpiry(LocalDate.of(2030, 5, 5));
        candidate.setSkills("Java, Spring");
        candidate.setCertifications("AWS Developer");
        candidate.setWorkExperience("5 Years");
        candidate.setSource(Source.JOB_BOARD);
        candidate.setStatus(CandidateStatus.REGISTERED);
        candidate.setDocuments(new ArrayList<>());

        assertEquals("John", candidate.getFirstName());
        assertEquals("Doe", candidate.getLastName());
        assertEquals("Indian", candidate.getNationality());
        assertEquals(LocalDate.of(1995, 1, 1), candidate.getDateOfBirth());
        assertEquals("john.doe@example.com", candidate.getEmail());
        assertEquals("+123456789", candidate.getPhone());
        assertEquals("+123456789", candidate.getWhatsappNumber());
        assertEquals("P123456", candidate.getPassportNumber());
        assertEquals("N987654", candidate.getNationalId());
        assertEquals(LocalDate.of(2030, 5, 5), candidate.getPassportExpiry());
        assertEquals("Java, Spring", candidate.getSkills());
        assertEquals("AWS Developer", candidate.getCertifications());
        assertEquals("5 Years", candidate.getWorkExperience());
        assertEquals(Source.JOB_BOARD, candidate.getSource());
        assertEquals(CandidateStatus.REGISTERED, candidate.getStatus());
        assertNotNull(candidate.getDocuments());
    }

    @Test
    void testCandidateApplicationPojo() {
        CandidateApplication app = new CandidateApplication();
        UUID candidateId = UUID.randomUUID();
        UUID requisitionId = UUID.randomUUID();
        app.setCandidateId(candidateId);
        app.setRequisitionId(requisitionId);
        app.setStatus(CandidateApplicationStatus.APPLIED);
        app.setInterviewNotes("Good candidate");
        app.setOfferedSalary(BigDecimal.valueOf(5000));
        app.setStartDate(LocalDate.of(2026, 9, 1));

        assertEquals(candidateId, app.getCandidateId());
        assertEquals(requisitionId, app.getRequisitionId());
        assertEquals(CandidateApplicationStatus.APPLIED, app.getStatus());
        assertEquals("Good candidate", app.getInterviewNotes());
        assertEquals(BigDecimal.valueOf(5000), app.getOfferedSalary());
        assertEquals(LocalDate.of(2026, 9, 1), app.getStartDate());
    }

    @Test
    void testCandidateDocumentPojo() {
        CandidateDocument doc = new CandidateDocument();
        UUID id = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();
        doc.setId(id);
        doc.setFileName("resume.pdf");
        doc.setFileType("pdf");
        doc.setS3Key("resumes/123.pdf");
        doc.setStatus(DocumentStatus.CLEAN);
        doc.setUploadedAt(now);
        doc.setUploadedBy("recruiter");

        assertEquals(id, doc.getId());
        assertEquals("resume.pdf", doc.getFileName());
        assertEquals("pdf", doc.getFileType());
        assertEquals("resumes/123.pdf", doc.getS3Key());
        assertEquals(DocumentStatus.CLEAN, doc.getStatus());
        assertEquals(now, doc.getUploadedAt());
        assertEquals("recruiter", doc.getUploadedBy());
    }

    @Test
    void testEnums() {
        assertNotNull(Source.valueOf("JOB_BOARD"));
        assertNotNull(CandidateStatus.valueOf("REGISTERED"));
        assertNotNull(CandidateApplicationStatus.valueOf("APPLIED"));
        assertNotNull(DocumentStatus.valueOf("CLEAN"));
    }
}
