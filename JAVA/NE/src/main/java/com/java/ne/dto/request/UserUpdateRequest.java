package com.java.ne.dto.request;

import com.java.ne.enums.AccountStatus;
import com.java.ne.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record UserUpdateRequest(
        String fullName,
        @Email String email,
        @Pattern(regexp = "^[0-9+]{9,15}$") String phoneNumber,
        AccountStatus status,
        Role role,
        String address
) {
}
