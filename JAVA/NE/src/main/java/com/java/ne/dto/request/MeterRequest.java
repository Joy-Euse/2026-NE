package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.enums.MeterType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record MeterRequest(
        @NotBlank @Size(max = 30) @Pattern(regexp = "^[A-Z0-9-]+$", message = "Meter number may contain only uppercase letters, numbers, and hyphens") String meterNumber,
        @NotNull MeterType meterType,
        @NotNull @PastOrPresent LocalDate installationDate,
        @NotNull @Positive Long customerId
) {
}
