package com.java.ne.dto.response;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import java.time.LocalDateTime;

public record ApiMessageResponse(
        String message,
        LocalDateTime timestamp
) {
}
