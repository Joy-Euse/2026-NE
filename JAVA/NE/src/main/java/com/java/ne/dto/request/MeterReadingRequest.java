package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MeterReadingRequest(
        @NotNull @Positive Long meterId,
        @NotNull @PositiveOrZero BigDecimal previousReading,
        @NotNull @PositiveOrZero BigDecimal currentReading,
        @NotNull @Min(1) @Max(12) Integer readingMonth,
        @NotNull @Min(2000) Integer readingYear,
        @NotNull @PastOrPresent LocalDate readingDate
) {
}
