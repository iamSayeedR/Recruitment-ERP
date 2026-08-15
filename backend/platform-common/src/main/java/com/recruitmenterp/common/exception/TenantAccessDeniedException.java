package com.recruitmenterp.common.exception;

public class TenantAccessDeniedException extends BusinessException {
    public TenantAccessDeniedException(String message) {
        super(message);
    }
}
