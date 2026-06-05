package com.java.ne.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record TariffTierRequest(
        @NotNull @PositiveOrZero BigDecimal minUnit,
        @Positive BigDecimal maxUnit,
        @NotNull @Positive BigDecimal ratePerUnit
) {
}
