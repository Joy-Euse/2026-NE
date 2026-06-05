package com.java.ne.service;

import com.java.ne.dto.response.NotificationResponse;
import com.java.ne.entity.Bill;
import com.java.ne.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    void createBillGeneratedNotification(Customer customer, Bill bill);

    void createFullPaymentNotification(Customer customer, Bill bill);

    Page<NotificationResponse> getAll(Pageable pageable);

    Page<NotificationResponse> getByCustomer(Long customerId, Pageable pageable);
}
