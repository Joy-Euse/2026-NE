package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendOtpRequest(
        @Email @NotBlank String email
) {
}
