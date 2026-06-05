package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CustomerRequest(
        @NotBlank String fullName,
        @Pattern(regexp = "^[0-9]{16}$", message = "National ID must contain exactly 16 numbers") String nationalId,
        @Email @NotBlank String email,
        @Pattern(regexp = "^[0-9+]{9,15}$") String phoneNumber,
        @NotBlank String address
) {
}
