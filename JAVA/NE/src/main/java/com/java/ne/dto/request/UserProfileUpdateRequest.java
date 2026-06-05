package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record UserProfileUpdateRequest(
        String fullName,
        @Email String email,
        @Pattern(regexp = "^07[2389][0-9]{7}$", message = "Phone number must be 10 digits and start with 072, 073, 078, or 079") String phoneNumber,
        String address,
        String password
) {
}
