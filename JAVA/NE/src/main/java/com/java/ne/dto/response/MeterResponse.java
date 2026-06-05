package com.java.ne.dto.response;

import com.java.ne.enums.MeterStatus;
import com.java.ne.enums.MeterType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MeterResponse(
        Long id,
        String meterNumber,
        MeterType meterType,
        LocalDate installationDate,
        MeterStatus status,
        Long customerId,
        String customerName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
