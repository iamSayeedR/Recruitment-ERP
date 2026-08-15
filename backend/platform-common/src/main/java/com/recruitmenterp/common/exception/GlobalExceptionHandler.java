package com.recruitmenterp.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private String getTraceId() {
        return MDC.get("correlationId");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String details = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.UNPROCESSABLE_ENTITY.value(),
            "VALIDATION_ERROR",
            details,
            request.getRequestURI(),
            getTraceId()
        );
        log.warn("Validation error: {}", details);
        return new ResponseEntity<>(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.UNPROCESSABLE_ENTITY.value(),
            "VALIDATION_ERROR",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        log.warn("Constraint violation: {}", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFoundException(EntityNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.NOT_FOUND.value(),
            "NOT_FOUND",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        log.warn("Entity not found: {}", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TenantAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleTenantAccessDeniedException(TenantAccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.FORBIDDEN.value(),
            "FORBIDDEN",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        log.warn("Tenant access denied: {}", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.FORBIDDEN.value(),
            "FORBIDDEN",
            "Access is denied",
            request.getRequestURI(),
            getTraceId()
        );
        log.warn("Access denied: {}", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        HttpStatus status = ex instanceof InvalidStateTransitionException ? HttpStatus.UNPROCESSABLE_ENTITY : HttpStatus.CONFLICT;
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            status.value(),
            "BUSINESS_ERROR",
            ex.getMessage(),
            request.getRequestURI(),
            getTraceId()
        );
        log.warn("Business error: {}", ex.getMessage());
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.BAD_REQUEST.value(),
            "BAD_REQUEST",
            "Malformed request body",
            request.getRequestURI(),
            getTraceId()
        );
        log.warn("Malformed request: {}", ex.getMessage());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
            Instant.now(),
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            request.getRequestURI(),
            getTraceId()
        );
        log.error("Unhandled exception: ", ex);
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
