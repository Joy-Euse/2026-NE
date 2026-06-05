package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.enums.MeterType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record MeterRequest(
        @NotBlank String meterNumber,
        @NotNull MeterType meterType,
        @NotNull @PastOrPresent LocalDate installationDate,
        @NotNull Long customerId
) {
}
