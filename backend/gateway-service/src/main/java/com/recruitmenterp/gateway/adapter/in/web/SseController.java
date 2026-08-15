package com.recruitmenterp.gateway.adapter.in.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class SseController {

    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping("/stream")
    public SseEmitter streamEvents(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String tenantId = jwt.getClaimAsString("tenantId");

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(tenantId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(tenantId, emitter));
        emitter.onTimeout(() -> removeEmitter(tenantId, emitter));
        emitter.onError(e -> removeEmitter(tenantId, emitter));

        return emitter;
    }

    private void removeEmitter(String tenantId, SseEmitter emitter) {
        List<SseEmitter> tenantEmitters = emitters.get(tenantId);
        if (tenantEmitters != null) {
            tenantEmitters.remove(emitter);
        }
    }
}
