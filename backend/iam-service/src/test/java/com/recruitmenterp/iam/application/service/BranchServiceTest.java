package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.multitenancy.TenantContext;
import com.recruitmenterp.iam.adapter.out.persistence.BranchRepository;
import com.recruitmenterp.iam.application.dto.BranchResponse;
import com.recruitmenterp.iam.application.dto.CreateBranchRequest;
import com.recruitmenterp.common.api.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.recruitmenterp.iam.application.mapper.BranchMapper;
import com.recruitmenterp.iam.domain.model.Branch;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BranchServiceTest {

    @Mock
    private BranchRepository branchRepository;
    @Mock
    private BranchMapper branchMapper;
    @Mock
    private TenantContext tenantContext;

    @InjectMocks
    private BranchService branchService;

    @Test
    void testCreateBranch_Success() {
        CreateBranchRequest request = new CreateBranchRequest("Test", "T1", "UK", "London", "", "", "");
        Branch branch = new Branch();
        
        when(tenantContext.getTenantId()).thenReturn("tenant1");
        when(branchMapper.toEntity(request)).thenReturn(branch);
        when(branchRepository.save(any(Branch.class))).thenReturn(branch);
        when(branchMapper.toResponse(branch)).thenReturn(new BranchResponse(null, null, null, null, null, null, null));

        branchService.createBranch(request);

        verify(branchRepository, times(1)).save(branch);
    }

    @Test
    void testListBranches_Success() {
        Pageable pageable = mock(Pageable.class);
        Branch branch = new Branch();
        Page<Branch> page = new PageImpl<>(List.of(branch));
        
        when(branchRepository.findAll(pageable)).thenReturn(page);
        when(branchMapper.toResponse(branch)).thenReturn(new BranchResponse(null, null, null, null, null, null, null));

        PagedResponse<BranchResponse> response = branchService.listBranches(pageable);
        
        org.junit.jupiter.api.Assertions.assertEquals(1, response.content().size());
        verify(branchRepository).findAll(pageable);
    }
}
