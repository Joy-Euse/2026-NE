package com.java.ne.repository;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.entity.Meter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeterRepository extends JpaRepository<Meter, Long> {
    boolean existsByMeterNumber(String meterNumber);

    Page<Meter> findByCustomerId(Long customerId, Pageable pageable);
}
