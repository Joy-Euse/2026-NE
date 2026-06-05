package com.java.ne.service;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.response.NotificationResponse;
import com.java.ne.entity.Bill;
import com.java.ne.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/*
 * Coordinates notification records and email delivery.
 */
public interface NotificationService {
    void createBillGeneratedNotification(Customer customer, Bill bill);

    void createFullPaymentNotification(Customer customer, Bill bill);

    Page<NotificationResponse> getAll(Pageable pageable);

    Page<NotificationResponse> getByCustomer(Long customerId, Pageable pageable);

    void sendPendingEmailNotifications();
}
