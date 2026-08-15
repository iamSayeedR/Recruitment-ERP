package com.recruitmenterp.iam.adapter.in.rest;

import com.recruitmenterp.iam.application.dto.ClientResponse;
import com.recruitmenterp.iam.application.dto.CreateClientRequest;
import com.recruitmenterp.iam.application.service.ClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "Client management API")
public class ClientController {
    private final ClientService clientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'RECRUITER', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "List all clients")
    @ApiResponse(responseCode = "200", description = "List of clients")
    public java.util.List<ClientResponse> getClients() {
        return clientService.getClients();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'BRANCH_MANAGER', 'RECRUITER', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "Create a new client")
    @ApiResponse(responseCode = "200", description = "Client created")
    public ClientResponse createClient(@Valid @RequestBody CreateClientRequest request) {
        return clientService.createClient(request);
    }
}
