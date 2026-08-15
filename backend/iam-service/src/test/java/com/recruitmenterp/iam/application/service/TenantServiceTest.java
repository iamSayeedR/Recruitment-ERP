package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.exception.BusinessException;
import com.recruitmenterp.iam.adapter.out.persistence.TenantRepository;
import com.recruitmenterp.iam.domain.model.Tenant;
import com.recruitmenterp.iam.domain.model.TenantStatus;
import com.recruitmenterp.iam.application.dto.TenantBrandingResponse;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TenantServiceTest {

    @Mock
    private TenantRepository tenantRepository;
    


    @InjectMocks
    private TenantService tenantService;



    @Test
    void testDeactivateTenant_Success() {
        UUID id = UUID.randomUUID();
        Tenant t = new Tenant();
        t.setId(id);
        t.setStatus(TenantStatus.ACTIVE);

        when(tenantRepository.findById(id)).thenReturn(Optional.of(t));

        tenantService.deactivateTenant(id);

        verify(tenantRepository, times(1)).save(t);
    }

    @Test
    void testDeactivateTenant_NotFound() {
        UUID id = UUID.randomUUID();
        when(tenantRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> tenantService.deactivateTenant(id));
    }

    @Test
    void testGetTenantBrandingByCode_Success() {
        Tenant t = new Tenant();
        t.setName("Acme Corp");
        t.setLogoUrl("http://logo.com");
        t.setPrimaryColor("#000");
        t.setSecondaryColor("#FFF");
        when(tenantRepository.findByCode("ACME")).thenReturn(Optional.of(t));

        TenantBrandingResponse response = tenantService.getTenantBrandingByCode("ACME");
        assertEquals("Acme Corp", response.name());
        assertEquals("http://logo.com", response.logoUrl());
        assertEquals("#000", response.primaryColor());
        assertEquals("#FFF", response.secondaryColor());
    }

    @Test
    void testGetTenantBrandingByCode_NotFound() {
        when(tenantRepository.findByCode("INVALID")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> tenantService.getTenantBrandingByCode("INVALID"));
    }
}
