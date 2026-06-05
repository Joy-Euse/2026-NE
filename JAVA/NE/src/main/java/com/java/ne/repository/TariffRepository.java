package com.java.ne.repository;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.entity.Tariff;
import com.java.ne.enums.MeterType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TariffRepository extends JpaRepository<Tariff, Long> {
    Optional<Tariff> findFirstByMeterTypeAndActiveTrueAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(
            MeterType meterType,
            LocalDate cycleDate,
            LocalDate sameCycleDate
    );

    Optional<Tariff> findFirstByMeterTypeAndActiveTrueAndEffectiveFromLessThanEqualAndEffectiveToIsNull(
            MeterType meterType,
            LocalDate cycleDate
    );

    List<Tariff> findByMeterTypeAndActiveTrue(MeterType meterType);
}
