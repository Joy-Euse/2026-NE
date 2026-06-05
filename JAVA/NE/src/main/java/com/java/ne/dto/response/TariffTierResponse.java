package com.java.ne.dto.response;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import java.math.BigDecimal;

public record TariffTierResponse(
        Long id,
        BigDecimal minUnit,
        BigDecimal maxUnit,
        BigDecimal ratePerUnit
) {
}
