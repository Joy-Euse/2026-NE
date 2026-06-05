package com.java.ne.dto.response;

import com.java.ne.enums.MeterType;
import com.java.ne.enums.TariffType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TariffResponse(
        Long id,
        MeterType meterType,
        TariffType tariffType,
        BigDecimal ratePerUnit,
        BigDecimal fixedCharge,
        BigDecimal vatPercentage,
        BigDecimal penaltyPercentage,
        LocalDate effectiveFrom,
        LocalDate effectiveTo,
        boolean active,
        List<TariffTierResponse> tiers,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
