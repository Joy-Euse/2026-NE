package com.java.ne.dto.response;

import com.java.ne.enums.NotificationStatus;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long customerId,
        String customerName,
        Long billId,
        String billReference,
        String message,
        NotificationStatus status,
        LocalDateTime createdAt,
        LocalDateTime sentAt
) {
}
