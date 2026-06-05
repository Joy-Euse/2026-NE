package com.java.ne.dto.request;

import com.java.ne.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record PaymentRequest(
        @NotNull Long billId,
        @NotNull @Positive BigDecimal amountPaid,
        @NotNull PaymentMethod paymentMethod
) {
}
