package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @Size(max = 120) String fullName,
        @Email @Size(max = 120) String email,
        @Pattern(regexp = "^07[2389][0-9]{7}$", message = "Phone number must be 10 digits and start with 072, 073, 078, or 079") String phoneNumber,
        @Size(max = 255) String address,
        @Size(min = 8, max = 72) String password
) {
}
