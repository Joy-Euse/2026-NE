package com.java.ne.dto.request;

import com.java.ne.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @Pattern(regexp = "^[0-9+]{9,15}$") String phoneNumber,
        @NotBlank String password,
        @NotNull Role role
) {
}
