package com.java.ne.controller;

import com.java.ne.dto.response.NotificationResponse;
import com.java.ne.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<Page<NotificationResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(notificationService.getAll(pageable));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','CUSTOMER')")
    public ResponseEntity<Page<NotificationResponse>> getByCustomer(@PathVariable Long customerId, Pageable pageable) {
        return ResponseEntity.ok(notificationService.getByCustomer(customerId, pageable));
    }
}
