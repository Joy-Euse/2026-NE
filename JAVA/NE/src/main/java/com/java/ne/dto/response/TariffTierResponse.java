package com.java.ne.dto.response;

import java.math.BigDecimal;

public record TariffTierResponse(
        Long id,
        BigDecimal minUnit,
        BigDecimal maxUnit,
        BigDecimal ratePerUnit
) {
}
