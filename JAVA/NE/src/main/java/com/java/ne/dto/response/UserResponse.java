package com.java.ne.dto.response;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.enums.AccountStatus;
import com.java.ne.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        AccountStatus status,
        Role role,
        Long customerId,
        String address,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
