package com.java.ne.dto.response;

import com.java.ne.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        String paymentReference,
        Long billId,
        String billReference,
        BigDecimal amountPaid,
        PaymentMethod paymentMethod,
        LocalDateTime paymentDate,
        String recordedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
