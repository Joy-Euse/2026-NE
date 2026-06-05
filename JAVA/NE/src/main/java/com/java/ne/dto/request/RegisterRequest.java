package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RegisterRequest(
        @NotBlank String fullName,
        @Pattern(regexp = "^[0-9]{16}$", message = "National ID must contain exactly 16 numbers") String nationalId,
        @Email @NotBlank String email,
        @Pattern(regexp = "^07[2389][0-9]{7}$", message = "Phone number must be 10 digits and start with 072, 073, 078, or 079") String phoneNumber,
        @NotBlank String address,
        @NotBlank String password
) {
}
