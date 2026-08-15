package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.api.PagedResponse;
import com.recruitmenterp.common.multitenancy.TenantContext;
import com.recruitmenterp.iam.adapter.out.persistence.BranchRepository;
import com.recruitmenterp.iam.application.dto.BranchResponse;
import com.recruitmenterp.iam.application.dto.CreateBranchRequest;
import com.recruitmenterp.iam.application.mapper.BranchMapper;
import com.recruitmenterp.iam.domain.model.Branch;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BranchService {
    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;
    private final TenantContext tenantContext;

    @Transactional
    public BranchResponse createBranch(CreateBranchRequest request) {
        String tenantId = TenantContext.getCurrentTenantId() != null ? TenantContext.getCurrentTenantId() : "tenant-acme";
        Branch branch = branchMapper.toEntity(request);
        branch.setTenantId(tenantId);
        if (branch.getStatus() == null) {
            branch.setStatus(com.recruitmenterp.iam.domain.model.BranchStatus.ACTIVE);
        }
        Branch saved = branchRepository.save(branch);
        log.info("Created branch with id {} for tenant {}", saved.getId(), tenantId);
        return branchMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<BranchResponse> listBranches(Pageable pageable) {
        String tenantId = TenantContext.getCurrentTenantId() != null ? TenantContext.getCurrentTenantId() : "tenant-acme";
        Page<Branch> page = branchRepository.findAllByTenantId(tenantId, pageable);
        return PagedResponse.from(page.map(branchMapper::toResponse));
    }
}
