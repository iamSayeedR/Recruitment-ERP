package com.recruitmenterp.gateway.adapter.in.websocket;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@org.springframework.context.annotation.Lazy
public class TenantIsolationInterceptor implements ChannelInterceptor {

    private static final Pattern TOPIC_PATTERN = Pattern.compile("^/topic/tenant/([^/]+)/.*$");

    private final com.recruitmenterp.common.security.JwtTenantClaimExtractor claimExtractor;

    public TenantIsolationInterceptor(com.recruitmenterp.common.security.JwtTenantClaimExtractor claimExtractor) {
        this.claimExtractor = claimExtractor;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null) {
                Matcher matcher = TOPIC_PATTERN.matcher(destination);
                if (matcher.matches()) {
                    String topicTenantId = matcher.group(1);
                    Authentication user = (Authentication) accessor.getUser();
                    if (user != null && user.getPrincipal() instanceof Jwt) {
                        Jwt jwt = (Jwt) user.getPrincipal();
                        com.recruitmenterp.common.security.TenantClaims claims = claimExtractor.extract(jwt);
                        String userTenantId = claims.tenantId();
                        
                        if (!topicTenantId.equals(userTenantId)) {
                            // Security boundary: reject cross-tenant subscription
                            throw new AccessDeniedException("Access denied for tenant");
                        }
                    } else {
                        throw new AccessDeniedException("User not authenticated or missing JWT");
                    }
                }
            }
        }
        return message;
    }
}
