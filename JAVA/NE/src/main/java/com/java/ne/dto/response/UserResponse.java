package com.java.ne.dto.response;

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
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
