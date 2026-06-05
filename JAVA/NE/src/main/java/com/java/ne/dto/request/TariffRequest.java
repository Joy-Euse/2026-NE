package com.java.ne.dto.request;

import com.java.ne.enums.MeterType;
import com.java.ne.enums.TariffType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record TariffRequest(
        @NotNull MeterType meterType,
        @NotNull TariffType tariffType,
        @NotNull @Positive BigDecimal ratePerUnit,
        @NotNull @PositiveOrZero BigDecimal fixedCharge,
        @NotNull @PositiveOrZero BigDecimal vatPercentage,
        @NotNull @PositiveOrZero BigDecimal penaltyPercentage,
        @NotNull @FutureOrPresent LocalDate effectiveFrom,
        LocalDate effectiveTo,
        boolean active,
        @Valid List<TariffTierRequest> tiers
) {
}
