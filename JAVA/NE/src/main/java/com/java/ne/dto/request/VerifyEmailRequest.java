package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerifyEmailRequest(
        @Email @NotBlank String email,
        @Pattern(regexp = "^[0-9]{6}$", message = "OTP must contain exactly 6 digits") String otp
) {
}
