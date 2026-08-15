package com.recruitmenterp.candidate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.recruitmenterp.candidate.domain.model.*;
import com.recruitmenterp.candidate.adapter.out.persistence.*;
import com.recruitmenterp.candidate.application.dto.*;
import com.recruitmenterp.candidate.application.mapper.*;
import com.recruitmenterp.common.exception.InvalidStateTransitionException;
import com.recruitmenterp.candidate.application.service.CandidateService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

class CandidateServiceTest {

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private CandidateApplicationRepository applicationRepository;

    @Mock
    private CandidateDocumentRepository documentRepository;

    @Mock
    private CandidateMapper candidateMapper;

    private CandidateService candidateService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        candidateService = new CandidateService(
            candidateRepository,
            applicationRepository,
            documentRepository,
            candidateMapper,
            null
        );
    }

    @Test
    void testBulkUploadWithFormulaInjectionHygiene() {
        // Prepare CSV with normal data and formula injection payloads
        String csvContent = "John,Doe,john@dev.com,123456,USA,P123,N456,1990-01-01\n" +
                            "=HYPERLINK('evil.com'),+cmd|' /C calc'!A0,evil@dev.com,999,UK,-P999,@N999,2000-12-31";

        candidateService.bulkUploadCandidates(csvContent);

        ArgumentCaptor<Candidate> candidateCaptor = ArgumentCaptor.forClass(Candidate.class);
        verify(candidateRepository, times(2)).save(candidateCaptor.capture());

        Candidate first = candidateCaptor.getAllValues().get(0);
        assertEquals("John", first.getFirstName());
        assertEquals("Doe", first.getLastName());
        assertEquals("john@dev.com", first.getEmail());
        assertEquals("P123", first.getPassportNumber());

        Candidate second = candidateCaptor.getAllValues().get(1);
        assertEquals("'=HYPERLINK('evil.com')", second.getFirstName());
        assertEquals("'+cmd|' /C calc'!A0", second.getLastName());
        assertEquals("evil@dev.com", second.getEmail());
        assertEquals("'-P999", second.getPassportNumber());
        assertEquals("'@N999", second.getNationalId());
        assertEquals(LocalDate.of(2000, 12, 31), second.getPassportExpiry());
    }

    @Test
    void testScanDocumentMockUpdatesStatus() {
        UUID docId = UUID.randomUUID();
        CandidateDocument doc = new CandidateDocument();
        doc.setId(docId);
        doc.setStatus(DocumentStatus.PENDING_SCAN);

        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));

        candidateService.scanDocument(docId);

        verify(documentRepository).save(doc);
        assertEquals(DocumentStatus.CLEAN, doc.getStatus());
    }

    @Test
    void testGetCandidateById_Success() {
        UUID candidateId = UUID.randomUUID();
        Candidate candidate = new Candidate();
        candidate.setId(candidateId);
        candidate.setFirstName("John");
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        CandidateResponse mockResponse = new CandidateResponse(candidateId, "John", null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        when(candidateMapper.toDto(any(Candidate.class))).thenReturn(mockResponse);

        CandidateResponse response = candidateService.getCandidateById(candidateId);
        assertNotNull(response);
        assertEquals("John", response.firstName());
    }

    @Test
    void testUpdateCandidate_Success() {
        UUID candidateId = UUID.randomUUID();
        CreateCandidateRequest req = new CreateCandidateRequest("Jane", "Doe", "UK", null, "jane@example.com", null, null, null, null, null, null, null, null, null);
        Candidate candidate = new Candidate();
        candidate.setId(candidateId);
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any(Candidate.class))).thenAnswer(i -> i.getArguments()[0]);
        CandidateResponse mockResponse = new CandidateResponse(candidateId, "Jane", "Doe", null, null, "jane@example.com", null, "UK", null, null, null, null, null, null, null, null);
        when(candidateMapper.toDto(any(Candidate.class))).thenReturn(mockResponse);

        CandidateResponse response = candidateService.updateCandidate(candidateId, req);
        assertNotNull(response);
        assertEquals("Jane", response.firstName());
    }

    @Test
    void testDeleteCandidate_Success() {
        UUID candidateId = UUID.randomUUID();
        candidateService.deleteCandidate(candidateId);
        verify(candidateRepository, times(1)).deleteById(candidateId);
    }

    @Test
    void testVerifyMagicBytes_Success() {
        // PDF Magic Bytes: 25 50 44 46
        byte[] pdf = {0x25, 0x50, 0x44, 0x46};
        assertDoesNotThrow(() -> candidateService.verifyMagicBytes(pdf));

        // PNG Magic Bytes: 89 50 4E 47
        byte[] png = {(byte) 0x89, 0x50, 0x4E, 0x47};
        assertDoesNotThrow(() -> candidateService.verifyMagicBytes(png));

        // JPEG Magic Bytes: FF D8 FF
        byte[] jpeg = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00};
        assertDoesNotThrow(() -> candidateService.verifyMagicBytes(jpeg));
    }
    
    @Test
    void testBulkUploadCandidates() {
        String csv = "John,Doe,john@example.com,12345,US,P123,N123,2030-01-01\n" +
                     "=Jane,-Smith,@jane,+,UK,P456,N456,";
        candidateService.bulkUploadCandidates(csv);
        verify(candidateRepository, times(2)).save(any(Candidate.class));
    }

    @Test
    void testUploadDocument_Success() {
        UUID candidateId = UUID.randomUUID();
        Candidate candidate = new Candidate();
        candidate.setId(candidateId);
        when(candidateRepository.findById(candidateId)).thenReturn(Optional.of(candidate));
        
        byte[] pdf = {0x25, 0x50, 0x44, 0x46, 0x00};
        when(documentRepository.save(any(CandidateDocument.class))).thenAnswer(i -> i.getArguments()[0]);
        
        candidateService.uploadDocument(candidateId, pdf, "test.pdf");
        
        verify(documentRepository, times(1)).save(any(CandidateDocument.class));
        verify(candidateRepository, times(1)).save(candidate);
        assertEquals(1, candidate.getDocuments().size());
    }

    @Test
    void testScanDocument() {
        UUID docId = UUID.randomUUID();
        CandidateDocument doc = new CandidateDocument();
        doc.setId(docId);
        when(documentRepository.findById(docId)).thenReturn(Optional.of(doc));
        
        candidateService.scanDocument(docId);
        
        assertEquals(DocumentStatus.CLEAN, doc.getStatus());
        verify(documentRepository, times(1)).save(doc);
    }
    @Test
    void testVerifyMagicBytes_Failure() {
        // Plain text
        byte[] txt = {0x68, 0x65, 0x6C, 0x6C, 0x6F};
        assertThrows(IllegalArgumentException.class, () -> candidateService.verifyMagicBytes(txt));
    }

    @Test
    void testGeneratePresignedUploadUrl_TtlLimit() {
        UUID candidateId = UUID.randomUUID();
        String url = candidateService.generatePresignedUploadUrl(candidateId, "resume.pdf", "application/pdf");
        assertTrue(url.contains("expires=900"), "Presigned URL TTL must be strictly 15 minutes (900 seconds)");
    }

    @Test
    void testPassportExpirySyncsWithExpiryAlertDate() {
        Candidate candidate = new Candidate();
        LocalDate expiry = LocalDate.of(2030, 1, 1);
        
        candidate.setPassportExpiry(expiry);
        assertEquals(expiry, candidate.getPassportExpiry());
        assertEquals(expiry, candidate.getExpiryAlertDate());

        candidate.setExpiryAlertDate(null);
        candidate.syncExpiryAlertDate();
        assertEquals(expiry, candidate.getExpiryAlertDate());
    }

    @Test
    void testCandidateApplicationInvalidStateTransition() {
        CandidateApplication app = new CandidateApplication();
        app.setStatus(CandidateApplicationStatus.APPLIED);
        
        // APPLIED -> SCREENING is valid
        assertDoesNotThrow(() -> app.transitionTo(CandidateApplicationStatus.SCREENING, "recruiter1"));
        
        // SCREENING -> OFFER_ACCEPTED is invalid directly
        assertThrows(InvalidStateTransitionException.class, () -> app.transitionTo(CandidateApplicationStatus.OFFER_ACCEPTED, "recruiter1"));

        // APPLIED -> SELECTED is invalid
        app.setStatus(CandidateApplicationStatus.APPLIED);
        assertThrows(InvalidStateTransitionException.class, () -> app.transitionTo(CandidateApplicationStatus.SELECTED, "recruiter1"));
        
        // REJECTED -> INTERVIEWED is invalid
        app.setStatus(CandidateApplicationStatus.REJECTED);
        assertThrows(InvalidStateTransitionException.class, () -> app.transitionTo(CandidateApplicationStatus.INTERVIEWED, "recruiter1"));
    }
}
