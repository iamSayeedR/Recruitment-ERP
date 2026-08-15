package com.recruitmenterp.requisition;

import com.recruitmenterp.common.audit.AuditEventPublisher;
import com.recruitmenterp.requisition.adapter.out.persistence.RequisitionRepository;
import com.recruitmenterp.requisition.application.dto.CreateRequisitionRequest;
import com.recruitmenterp.requisition.application.dto.RequisitionResponse;
import com.recruitmenterp.requisition.application.mapper.RequisitionMapper;
import com.recruitmenterp.requisition.application.service.RequisitionService;
import com.recruitmenterp.common.exception.InvalidStateTransitionException;
import com.recruitmenterp.requisition.domain.model.JobCategory;
import com.recruitmenterp.requisition.domain.model.Requisition;
import com.recruitmenterp.requisition.domain.model.RequisitionPriority;
import com.recruitmenterp.requisition.domain.model.RequisitionStatus;
import com.recruitmenterp.requisition.application.dto.UpdateRequisitionRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequisitionServiceTest {

    @Mock
    private RequisitionRepository repository;

    @Mock
    private RequisitionMapper mapper;

    @Mock
    private AuditEventPublisher eventPublisher;

    @InjectMocks
    private RequisitionService service;

    private Requisition requisition;
    private UUID reqId;

    @BeforeEach
    void setUp() {
        reqId = UUID.randomUUID();
        requisition = new Requisition(UUID.randomUUID(), UUID.randomUUID(), "Test Title", "Desc",
                JobCategory.BLUE_COLLAR, "UAE", 10, "1000-2000", "None", 24, "Skill", "Cert", RequisitionPriority.HIGH);
        requisition.setId(reqId);
        requisition.setTenantId("tenant-123");
    }

    @Test
    void createRequisition_Success() {
        CreateRequisitionRequest req = new CreateRequisitionRequest(UUID.randomUUID(), UUID.randomUUID(), "Test", "Desc", JobCategory.BLUE_COLLAR, "UAE", 10, null, null, null, null, null, RequisitionPriority.HIGH);
        when(repository.save(any(Requisition.class))).thenAnswer(i -> {
            Requisition r = i.getArgument(0);
            r.setId(UUID.randomUUID());
            r.setTenantId("tenant-123");
            return r;
        });
        
        service.createRequisition(req);
        
        verify(repository).save(any(Requisition.class));
        verify(eventPublisher).publish(any());
    }

    @Test
    void transitionStatus_Success() {
        when(repository.findById(reqId)).thenReturn(Optional.of(requisition));
        when(repository.save(any(Requisition.class))).thenReturn(requisition);

        service.transitionStatus(reqId, RequisitionStatus.APPROVED, "Approved by manager", "user1");

        assertEquals(RequisitionStatus.APPROVED, requisition.getStatus());
        assertEquals("user1", requisition.getApprovedBy());
        verify(repository).save(requisition);
        verify(eventPublisher).publish(any());
    }

    @Test
    void transitionStatus_InvalidTransition_ThrowsException() {
        when(repository.findById(reqId)).thenReturn(Optional.of(requisition));
        
        // Test DRAFT -> FILLED
        assertThrows(InvalidStateTransitionException.class, () -> 
            service.transitionStatus(reqId, RequisitionStatus.FILLED, "Filling", "user1")
        );
        
        // Setup to CLOSED
        requisition.transitionTo(RequisitionStatus.APPROVED, "actor", "note");
        requisition.transitionTo(RequisitionStatus.PUBLISHED, "actor", "note");
        requisition.transitionTo(RequisitionStatus.CLOSED, "actor", "note");

        // Test CLOSED -> APPROVED
        assertThrows(InvalidStateTransitionException.class, () -> 
            service.transitionStatus(reqId, RequisitionStatus.APPROVED, "Approve again", "user1")
        );
    }

    @Test
    void searchRequisitions_Success() {
        when(repository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(requisition)));
        
        Page<RequisitionResponse> result = service.searchRequisitions(JobCategory.BLUE_COLLAR, "UAE", RequisitionStatus.DRAFT, PageRequest.of(0, 10));
        
        assertNotNull(result);
        verify(repository).findAll(any(Specification.class), any(PageRequest.class));
    }

    @Test
    void getRequisitionById_Success() {
        when(repository.findById(reqId)).thenReturn(Optional.of(requisition));
        when(mapper.toResponse(requisition)).thenReturn(new RequisitionResponse(
                reqId, null, null, null, "Test Title", null, null, null, 0, 0, null, null, null, null, null, null, null, null, null, null, null, null, null));
        
        RequisitionResponse result = service.getRequisitionById(reqId);
        
        assertNotNull(result);
        assertEquals("Test Title", result.title());
        verify(repository).findById(reqId);
    }

    @Test
    void updateRequisition_Success() {
        when(repository.findById(reqId)).thenReturn(Optional.of(requisition));
        when(repository.save(any(Requisition.class))).thenReturn(requisition);
        when(mapper.toResponse(requisition)).thenReturn(new RequisitionResponse(
                reqId, null, null, null, "Updated Title", null, null, null, 0, 0, null, null, null, null, null, null, null, null, null, null, null, null, null));
        
        UpdateRequisitionRequest req = new UpdateRequisitionRequest(UUID.randomUUID(), UUID.randomUUID(), "Updated Title", "Updated Desc", JobCategory.WHITE_COLLAR, "UK", 5, "2000-3000", "Medical", 12, "Java", "AWS", RequisitionPriority.MEDIUM);
        RequisitionResponse result = service.updateRequisition(reqId, req);
        
        assertNotNull(result);
        assertEquals("Updated Title", result.title());
        verify(repository).save(requisition);
        verify(eventPublisher).publish(any());
    }

    @Test
    void getRequisitionById_NotFound_ThrowsException() {
        when(repository.findById(reqId)).thenReturn(Optional.empty());
        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> service.getRequisitionById(reqId));
    }

    @Test
    void updateRequisition_NotFound_ThrowsException() {
        when(repository.findById(reqId)).thenReturn(Optional.empty());
        UpdateRequisitionRequest req = new UpdateRequisitionRequest(null, null, "Updated Title", null, null, null, null, null, null, null, null, null, null);
        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> service.updateRequisition(reqId, req));
    }

    @Test
    void transitionStatus_NotFound_ThrowsException() {
        when(repository.findById(reqId)).thenReturn(Optional.empty());
        assertThrows(jakarta.persistence.EntityNotFoundException.class, () -> service.transitionStatus(reqId, RequisitionStatus.APPROVED, "notes", "actor"));
    }
}
