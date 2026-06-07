package com.java.ne.service.impl;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.PaymentRequest;
import com.java.ne.dto.response.PaymentResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.entity.Bill;
import com.java.ne.entity.Payment;
import com.java.ne.enums.BillStatus;
import com.java.ne.enums.Role;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.BillRepository;
import com.java.ne.repository.PaymentRepository;
import com.java.ne.repository.UserRepository;
import com.java.ne.service.NotificationService;
import com.java.ne.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final BillingMapper mapper;

    @Override
    @Transactional
    public PaymentResponse record(PaymentRequest request) {
        Bill bill = billRepository.findById(request.billId()).orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        AppUser recorder = currentUser();
        assertCustomerOwnsBill(recorder, bill);
        if (bill.getStatus() != BillStatus.APPROVED && bill.getStatus() != BillStatus.PARTIALLY_PAID && bill.getStatus() != BillStatus.OVERDUE) {
            throw new InvalidBusinessOperationException("Bill cannot be paid before approval");
        }
        if (request.amountPaid().compareTo(bill.getOutstandingBalance()) > 0) {
            throw new InvalidBusinessOperationException("Payment amount cannot exceed outstanding balance");
        }
        Payment payment = Payment.builder()
                .paymentReference("PAY-" + System.currentTimeMillis() + "-" + bill.getId())
                .bill(bill)
                .amountPaid(request.amountPaid())
                .paymentMethod(request.paymentMethod())
                .paymentDate(LocalDateTime.now())
                .recordedBy(recorder)
                .build();

        bill.setAmountPaid(bill.getAmountPaid().add(request.amountPaid()));
        bill.setOutstandingBalance(bill.getOutstandingBalance().subtract(request.amountPaid()));
        if (bill.getOutstandingBalance().compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(BillStatus.PAID);
            notificationService.createFullPaymentNotification(bill.getCustomer(), bill);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }
        billRepository.save(bill);
        Payment saved = paymentRepository.save(payment);
        log.info("Recorded payment {} for bill {}", saved.getPaymentReference(), bill.getBillReference());
        return mapper.toPaymentResponse(saved);
    }

    @Override
    public Page<PaymentResponse> getAll(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(mapper::toPaymentResponse);
    }

    @Override
    public Page<PaymentResponse> getByBill(Long billId, Pageable pageable) {
        return paymentRepository.findByBillId(billId, pageable).map(mapper::toPaymentResponse);
    }

    @Override
    public Page<PaymentResponse> getByCustomer(Long customerId, Pageable pageable) {
        return paymentRepository.findByBillCustomerId(customerId, pageable).map(mapper::toPaymentResponse);
    }

    private AppUser currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    private void assertCustomerOwnsBill(AppUser recorder, Bill bill) {
        if (recorder.getRole() != Role.ROLE_CUSTOMER) {
            return;
        }
        if (recorder.getCustomer() == null) {
            throw new InvalidBusinessOperationException("This account is not linked to a customer profile");
        }
        if (!recorder.getCustomer().getId().equals(bill.getCustomer().getId())) {
            throw new InvalidBusinessOperationException("Access denied: you can only pay your own bills");
        }
    }
}
