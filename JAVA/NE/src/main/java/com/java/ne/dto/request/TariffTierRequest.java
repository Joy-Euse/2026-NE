package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record TariffTierRequest(
        @NotNull @PositiveOrZero BigDecimal minUnit,
        @PositiveOrZero BigDecimal maxUnit,
        @NotNull @Positive BigDecimal ratePerUnit
) {
}
