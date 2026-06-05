package com.java.ne.dto.response;

import com.java.ne.enums.Role;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        Role role,
        Long customerId   // non-null when role == ROLE_CUSTOMER
) {
}
