package com.java.ne.dto.response;

import com.java.ne.enums.CustomerStatus;

import java.time.LocalDateTime;

public record CustomerResponse(
        Long id,
        String fullName,
        String nationalId,
        String email,
        String phoneNumber,
        String address,
        CustomerStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
