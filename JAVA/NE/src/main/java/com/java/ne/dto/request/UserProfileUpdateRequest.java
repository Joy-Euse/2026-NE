package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record UserProfileUpdateRequest(
        String fullName,
        @Email String email,
        @Pattern(regexp = "^[0-9+]{9,15}$") String phoneNumber,
        String address,
        String password
) {
}
