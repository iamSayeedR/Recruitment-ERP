package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.exception.BusinessException;
import com.recruitmenterp.common.multitenancy.TenantContext;
import com.recruitmenterp.iam.adapter.out.persistence.ClientRepository;
import com.recruitmenterp.iam.application.dto.CreateClientRequest;
import com.recruitmenterp.iam.application.mapper.ClientMapper;
import com.recruitmenterp.iam.domain.model.Client;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;
    @Mock
    private ClientMapper clientMapper;
    @Mock
    private TenantContext tenantContext;

    @InjectMocks
    private ClientService clientService;

    @Test
    void testCreateClient_DuplicateName() {
        CreateClientRequest request = new CreateClientRequest("Dupe", "", "", "", "", "", "");
        
        when(tenantContext.getTenantId()).thenReturn("tenant1");
        when(clientRepository.existsByNameAndTenantId("Dupe", "tenant1")).thenReturn(true);

        assertThrows(BusinessException.class, () -> clientService.createClient(request));
    }

    @Test
    void testCreateClient_Success() {
        CreateClientRequest request = new CreateClientRequest("New Client", "", "", "", "", "", "");
        
        when(tenantContext.getTenantId()).thenReturn("tenant1");
        when(clientRepository.existsByNameAndTenantId("New Client", "tenant1")).thenReturn(false);

        Client clientEntity = new Client();
        when(clientMapper.toEntity(request)).thenReturn(clientEntity);
        when(clientRepository.save(clientEntity)).thenReturn(clientEntity);
        
        com.recruitmenterp.iam.application.dto.ClientResponse responseDto = new com.recruitmenterp.iam.application.dto.ClientResponse(null, "tenant1", "New Client", "", "", "", "", "", "", "");
        when(clientMapper.toResponse(clientEntity)).thenReturn(responseDto);

        com.recruitmenterp.iam.application.dto.ClientResponse result = clientService.createClient(request);
        
        org.junit.jupiter.api.Assertions.assertEquals("New Client", result.name());
        verify(clientRepository).save(clientEntity);
    }
}
