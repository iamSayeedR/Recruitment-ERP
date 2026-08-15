package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.exception.BusinessException;
import com.recruitmenterp.common.exception.EntityNotFoundException;
import com.recruitmenterp.iam.adapter.out.persistence.TenantRepository;
import com.recruitmenterp.iam.domain.model.Tenant;
import com.recruitmenterp.iam.domain.model.TenantStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {
    private final TenantRepository tenantRepository;

    @Transactional
    public void deactivateTenant(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
        tenant.deactivate();
        tenantRepository.save(tenant);
        log.info("Deactivated tenant: {}", id);
    }

    @Transactional(readOnly = true)
    public com.recruitmenterp.iam.application.dto.TenantBrandingResponse getTenantBrandingByCode(String code) {
        Tenant tenant = tenantRepository.findByCode(code)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
        return new com.recruitmenterp.iam.application.dto.TenantBrandingResponse(
                tenant.getName(), tenant.getLogoUrl(), tenant.getPrimaryColor(), tenant.getSecondaryColor()
        );
    }
}
