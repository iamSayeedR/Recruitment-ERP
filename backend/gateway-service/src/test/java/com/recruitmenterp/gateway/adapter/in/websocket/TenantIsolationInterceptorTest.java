package com.recruitmenterp.gateway.adapter.in.websocket;

import com.recruitmenterp.common.security.JwtTenantClaimExtractor;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TenantIsolationInterceptorTest {

    private final TenantIsolationInterceptor interceptor = new TenantIsolationInterceptor(new JwtTenantClaimExtractor());

    @Test
    void shouldAllowSameTenantSubscription() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaimAsString("tenantId")).thenReturn("tenant-123");
        TestingAuthenticationToken auth = new TestingAuthenticationToken(jwt, null);

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/tenant/tenant-123/requisitions");
        accessor.setUser(auth);
        
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
        MessageChannel channel = mock(MessageChannel.class);

        Message<?> result = interceptor.preSend(message, channel);
        assertNotNull(result);
    }

    @Test
    void shouldRejectCrossTenantSubscription() {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getClaimAsString("tenantId")).thenReturn("tenant-123");
        TestingAuthenticationToken auth = new TestingAuthenticationToken(jwt, null);

        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/tenant/tenant-456/requisitions");
        accessor.setUser(auth);
        
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
        MessageChannel channel = mock(MessageChannel.class);

        assertThrows(AccessDeniedException.class, () -> interceptor.preSend(message, channel));
    }
    
    @Test
    void shouldRejectWhenUserNotAuthenticatedWithJwt() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        accessor.setDestination("/topic/tenant/tenant-123/requisitions");
        // No user set
        
        Message<?> message = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
        MessageChannel channel = mock(MessageChannel.class);

        assertThrows(AccessDeniedException.class, () -> interceptor.preSend(message, channel));
    }
}
