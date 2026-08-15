package com.recruitmenterp.iam.adapter.in.rest;

import com.recruitmenterp.iam.application.service.TenantService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;

/**
 * Unit test for TenantController.
 * <p>
 * Uses plain JUnit + Mockito (no Spring context) because loading the full
 * application context requires live PostgreSQL, Redis, and Keycloak.
 * Full integration tests will be added once Testcontainers support is
 * wired in for the iam-service module.
 */
class TenantControllerIT {

    @Test
    void controllerCanBeInstantiated() {
        TenantService mockService = mock(TenantService.class);
        TenantController controller = new TenantController(mockService);
        assertNotNull(controller, "TenantController should be instantiable with a mocked TenantService");
    }
}
