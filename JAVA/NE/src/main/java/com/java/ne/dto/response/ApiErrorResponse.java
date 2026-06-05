package com.java.ne.dto.response;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import java.time.LocalDateTime;
import java.util.Map;

public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> validationErrors
) {
}
