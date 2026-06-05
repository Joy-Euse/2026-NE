package com.java.ne.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CustomerRequest(
        @NotBlank String fullName,
        @NotBlank String nationalId,
        @Email @NotBlank String email,
        @Pattern(regexp = "^[0-9+]{9,15}$") String phoneNumber,
        @NotBlank String address
) {
}
