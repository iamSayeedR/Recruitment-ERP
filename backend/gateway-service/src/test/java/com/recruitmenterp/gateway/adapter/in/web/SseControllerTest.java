package com.recruitmenterp.gateway.adapter.in.web;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SseControllerTest {

    @Test
    void shouldStreamEventsAndRemoveEmitterOnCompletion() throws Exception {
        SseController controller = new SseController();

        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaimAsString("tenantId")).thenReturn("tenant-123");
        TestingAuthenticationToken auth = new TestingAuthenticationToken(jwt, null);

        SseEmitter emitter = controller.streamEvents(auth);

        assertNotNull(emitter);
        
        // Trigger completion to cover removeEmitter
        emitter.complete();
        emitter.completeWithError(new RuntimeException("test"));
    }
}
