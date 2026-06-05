package com.java.ne.service;

import com.java.ne.dto.request.PaymentRequest;
import com.java.ne.dto.response.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {
    PaymentResponse record(PaymentRequest request);

    Page<PaymentResponse> getAll(Pageable pageable);

    Page<PaymentResponse> getByBill(Long billId, Pageable pageable);

    Page<PaymentResponse> getByCustomer(Long customerId, Pageable pageable);
}
