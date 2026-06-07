package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull @Positive Long billId,
        @NotNull @Positive BigDecimal amountPaid,
        @NotNull PaymentMethod paymentMethod
) {
}
