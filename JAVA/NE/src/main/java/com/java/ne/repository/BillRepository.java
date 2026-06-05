package com.java.ne.repository;

import com.java.ne.entity.Bill;
import com.java.ne.enums.BillStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillReference(String billReference);

    boolean existsByMeterReadingId(Long meterReadingId);

    Page<Bill> findByCustomerId(Long customerId, Pageable pageable);

    Page<Bill> findByBillingMonthAndBillingYear(Integer billingMonth, Integer billingYear, Pageable pageable);

    Page<Bill> findByStatusIn(Iterable<BillStatus> statuses, Pageable pageable);
}
