package com.recruitmenterp.iam.application.service;

import com.recruitmenterp.common.exception.DuplicateEntityException;
import com.recruitmenterp.common.multitenancy.TenantContext;
import com.recruitmenterp.iam.adapter.out.persistence.ClientRepository;
import com.recruitmenterp.iam.application.dto.ClientResponse;
import com.recruitmenterp.iam.application.dto.CreateClientRequest;
import com.recruitmenterp.iam.application.mapper.ClientMapper;
import com.recruitmenterp.iam.domain.model.Client;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClientService {
    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Transactional
    public java.util.List<ClientResponse> getClients() {
        String tenantId = TenantContext.getCurrentTenantId() != null ? TenantContext.getCurrentTenantId() : "tenant-acme";
        java.util.List<Client> existing = clientRepository.findAllByTenantId(tenantId);
        if (existing.isEmpty()) {
            Client c1 = new Client();
            c1.setTenantId(tenantId);
            c1.setName("Saudi Aramco Project Division");
            c1.setIndustry("Oil & Gas");
            c1.setCountry("Saudi Arabia");
            c1.setContactPerson("Fahad Al-Harbi");
            c1.setContactEmail("fahad@aramco-services.sa");
            c1.setContactPhone("+966 13 874 0000");

            Client c2 = new Client();
            c2.setTenantId(tenantId);
            c2.setName("Emaar Hospitality Group");
            c2.setIndustry("Real Estate & Construction");
            c2.setCountry("UAE");
            c2.setContactPerson("Rashid Al-Maktoum");
            c2.setContactEmail("rashid@emaar-group.ae");
            c2.setContactPhone("+971 4 367 3333");

            Client c3 = new Client();
            c3.setTenantId(tenantId);
            c3.setName("Qatar Foundation Contracting");
            c3.setIndustry("Infrastructure & EPC");
            c3.setCountry("Qatar");
            c3.setContactPerson("Youssef Al-Kuwari");
            c3.setContactEmail("youssef@qf-contracting.qa");
            c3.setContactPhone("+974 4454 0000");

            clientRepository.saveAll(java.util.List.of(c1, c2, c3));
            existing = clientRepository.findAllByTenantId(tenantId);
        }
        return existing.stream()
                .map(clientMapper::toResponse)
                .toList();
    }

    @Transactional
    public ClientResponse createClient(CreateClientRequest request) {
        String tenantId = TenantContext.getCurrentTenantId() != null ? TenantContext.getCurrentTenantId() : "tenant-acme";
        if (clientRepository.existsByNameAndTenantId(request.name(), tenantId)) {
            throw new DuplicateEntityException("Client with this name already exists in this tenant");
        }
        Client client = clientMapper.toEntity(request);
        client.setTenantId(tenantId);
        Client saved = clientRepository.save(client);
        log.info("Created client {} for tenant {}", saved.getId(), tenantId);
        return clientMapper.toResponse(saved);
    }
}
