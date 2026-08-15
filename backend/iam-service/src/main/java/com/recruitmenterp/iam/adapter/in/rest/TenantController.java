package com.recruitmenterp.iam.adapter.in.rest;

import com.recruitmenterp.iam.application.service.TenantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@Tag(name = "Tenants", description = "Tenant management API")
public class TenantController {
    private final TenantService tenantService;

    // Endpoints omitted for brevity
}
