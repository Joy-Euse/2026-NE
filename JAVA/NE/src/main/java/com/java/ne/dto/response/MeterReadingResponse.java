package com.java.ne.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record MeterReadingResponse(
        Long id,
        Long meterId,
        String meterNumber,
        BigDecimal previousReading,
        BigDecimal currentReading,
        BigDecimal consumption,
        Integer readingMonth,
        Integer readingYear,
        LocalDate readingDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
