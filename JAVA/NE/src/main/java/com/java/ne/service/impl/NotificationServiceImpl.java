package com.java.ne.service.impl;

import com.java.ne.dto.response.NotificationResponse;
import com.java.ne.entity.Bill;
import com.java.ne.entity.Customer;
import com.java.ne.entity.Notification;
import com.java.ne.enums.NotificationStatus;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.NotificationRepository;
import com.java.ne.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final BillingMapper mapper;

    @Override
    public void createBillGeneratedNotification(Customer customer, Bill bill) {
        String message = "Dear %s,\nYour %02d/%d utility bill of %s FRW has been successfully processed."
                .formatted(customer.getFullName(), bill.getBillingMonth(), bill.getBillingYear(), bill.getTotalAmount());
        create(customer, bill, message);
    }

    @Override
    public void createFullPaymentNotification(Customer customer, Bill bill) {
        String message = "Dear %s,\nYour utility bill %s has been fully paid. Thank you."
                .formatted(customer.getFullName(), bill.getBillReference());
        create(customer, bill, message);
    }

    @Override
    public Page<NotificationResponse> getAll(Pageable pageable) {
        return notificationRepository.findAll(pageable).map(mapper::toNotificationResponse);
    }

    @Override
    public Page<NotificationResponse> getByCustomer(Long customerId, Pageable pageable) {
        return notificationRepository.findByCustomerId(customerId, pageable).map(mapper::toNotificationResponse);
    }

    private void create(Customer customer, Bill bill, String message) {
        notificationRepository.save(Notification.builder()
                .customer(customer)
                .bill(bill)
                .message(message)
                .status(NotificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build());
    }
}
