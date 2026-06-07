package com.java.ne.service.impl;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.response.NotificationResponse;
import com.java.ne.entity.Bill;
import com.java.ne.entity.Customer;
import com.java.ne.entity.Notification;
import com.java.ne.enums.NotificationStatus;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.NotificationRepository;
import com.java.ne.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/*
 * Stores notifications and sends each notification message to the customer's email address.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final BillingMapper mapper;

    @Value("${spring.mail.username:no-reply@utility.local}")
    private String fromAddress;

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

    @Override
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void sendPendingEmailNotifications() {
        notificationRepository.findTop25ByStatusOrderByCreatedAtAsc(NotificationStatus.PENDING)
                .forEach(this::sendEmailAndUpdateStatus);
    }

    @Transactional
    private void create(Customer customer, Bill bill, String message) {
        Notification notification = notificationRepository.save(Notification.builder()
                .customer(customer)
                .bill(bill)
                .message(message)
                .status(NotificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build());
        sendEmailAndUpdateStatus(notification);
    }

    private void sendEmailAndUpdateStatus(Notification notification) {
        String recipient = notification.getCustomer().getEmail();
        if (!StringUtils.hasText(recipient)) {
            notification.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(notification);
            log.warn("Notification {} failed because customer has no email", notification.getId());
            return;
        }

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(fromAddress);
            email.setTo(recipient);
            email.setSubject("Utility Billing Notification");
            email.setText(notification.getMessage());
            mailSender.send(email);

            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
            log.info("Notification {} emailed to {}", notification.getId(), recipient);
        } catch (MailException ex) {
            notification.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(notification);
            log.warn("Failed to email notification {} to {}: {}", notification.getId(), recipient, ex.getMessage());
        }
    }
}
