package com.recruitmenterp.common.api;

import com.recruitmenterp.common.multitenancy.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.lang.NonNull;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdempotencyKeyInterceptor implements HandlerInterceptor {

    private static final String IDEMPOTENCY_KEY_HEADER = "X-Idempotency-Key";
    private final StringRedisTemplate redisTemplate;
    private final TenantContext tenantContext;

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) {
        String method = request.getMethod();
        if (!("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method))) {
            return true;
        }

        String idempotencyKey = request.getHeader(IDEMPOTENCY_KEY_HEADER);
        if (idempotencyKey == null || idempotencyKey.isEmpty()) {
            return true;
        }

        String redisKey = String.format("idempotency:%s:%s", tenantContext.getTenantId(), idempotencyKey);
        Boolean isNewKey = redisTemplate.opsForValue().setIfAbsent(redisKey, "PROCESSING", 24, TimeUnit.HOURS);

        if (Boolean.FALSE.equals(isNewKey)) {
            response.setStatus(HttpStatus.CONFLICT.value());
            log.warn("Idempotent request conflict for key: {}", idempotencyKey);
            return false;
        }

        return true;
    }
    
    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, Exception ex) {
        String idempotencyKey = request.getHeader(IDEMPOTENCY_KEY_HEADER);
        if (idempotencyKey != null && (ex == null && response.getStatus() < 400)) {
             String redisKey = String.format("idempotency:%s:%s", tenantContext.getTenantId(), idempotencyKey);
             redisTemplate.opsForValue().set(redisKey, "COMPLETED", 24, TimeUnit.HOURS);
        }
    }
}
