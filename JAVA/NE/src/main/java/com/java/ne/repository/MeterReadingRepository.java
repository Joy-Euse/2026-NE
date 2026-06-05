package com.java.ne.repository;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.entity.MeterReading;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    boolean existsByMeterIdAndReadingMonthAndReadingYear(Long meterId, Integer readingMonth, Integer readingYear);

    Page<MeterReading> findByMeterId(Long meterId, Pageable pageable);

    Page<MeterReading> findByReadingMonthAndReadingYear(Integer readingMonth, Integer readingYear, Pageable pageable);
}
