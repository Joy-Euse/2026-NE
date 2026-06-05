package com.java.ne.repository;

import com.java.ne.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByBillId(Long billId, Pageable pageable);

    Page<Payment> findByBillCustomerId(Long customerId, Pageable pageable);
}
