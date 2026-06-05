package com.java.ne.dto.response;

import com.java.ne.enums.BillStatus;
import com.java.ne.enums.MeterType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record BillResponse(
        Long id,
        String billReference,
        Long customerId,
        String customerName,
        Long meterId,
        String meterNumber,
        MeterType meterType,
        Long meterReadingId,
        Integer billingMonth,
        Integer billingYear,
        BigDecimal consumption,
        BigDecimal amountBeforeTax,
        BigDecimal fixedCharge,
        BigDecimal taxAmount,
        BigDecimal penaltyAmount,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal outstandingBalance,
        BillStatus status,
        LocalDate dueDate,
        String approvedBy,
        LocalDateTime approvedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
