package com.java.ne.service.impl;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.BillGenerationRequest;
import com.java.ne.dto.response.BillResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.entity.Bill;
import com.java.ne.entity.MeterReading;
import com.java.ne.entity.Tariff;
import com.java.ne.entity.TariffTier;
import com.java.ne.enums.BillStatus;
import com.java.ne.enums.CustomerStatus;
import com.java.ne.enums.MeterStatus;
import com.java.ne.enums.TariffType;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.BillRepository;
import com.java.ne.repository.MeterReadingRepository;
import com.java.ne.repository.TariffRepository;
import com.java.ne.repository.UserRepository;
import com.java.ne.service.BillService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillServiceImpl implements BillService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final BillRepository billRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final TariffRepository tariffRepository;
    private final UserRepository userRepository;
    private final BillingMapper mapper;

    @Override
    @Transactional
    public BillResponse generate(BillGenerationRequest request) {
        if (billRepository.existsByMeterReadingId(request.meterReadingId())) {
            throw new DuplicateResourceException("A bill already exists for this meter reading");
        }
        MeterReading reading = meterReadingRepository.findById(request.meterReadingId()).orElseThrow(() -> new ResourceNotFoundException("Meter reading not found"));
        if (reading.getMeter().getCustomer().getStatus() != CustomerStatus.ACTIVE) {
            throw new InvalidBusinessOperationException("Inactive customers cannot receive bills");
        }
        if (reading.getMeter().getStatus() != MeterStatus.ACTIVE) {
            throw new InvalidBusinessOperationException("Inactive meters cannot receive bills");
        }
        LocalDate cycleDate = LocalDate.of(reading.getReadingYear(), reading.getReadingMonth(), 1);
        Tariff tariff = findTariff(reading, cycleDate);
        BigDecimal amountBeforeTax = calculateUsageCharge(reading.getConsumption(), tariff).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fixedCharge = tariff.getFixedCharge().setScale(2, RoundingMode.HALF_UP);
        BigDecimal taxAmount = amountBeforeTax.add(fixedCharge).multiply(tariff.getVatPercentage()).divide(HUNDRED, 2, RoundingMode.HALF_UP);
        BigDecimal penaltyAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = amountBeforeTax.add(fixedCharge).add(taxAmount).add(penaltyAmount).setScale(2, RoundingMode.HALF_UP);

        Bill bill = Bill.builder()
                .billReference("BILL-" + System.currentTimeMillis() + "-" + reading.getId())
                .customer(reading.getMeter().getCustomer())
                .meter(reading.getMeter())
                .meterReading(reading)
                .billingMonth(reading.getReadingMonth())
                .billingYear(reading.getReadingYear())
                .consumption(reading.getConsumption())
                .amountBeforeTax(amountBeforeTax)
                .fixedCharge(fixedCharge)
                .taxAmount(taxAmount)
                .penaltyAmount(penaltyAmount)
                .totalAmount(totalAmount)
                .amountPaid(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP))
                .outstandingBalance(totalAmount)
                .status(BillStatus.PENDING)
                .dueDate(cycleDate.plusMonths(1).plusDays(14))
                .build();
        Bill saved = billRepository.save(bill);
        log.info("Generated bill {}", saved.getBillReference());
        return mapper.toBillResponse(saved);
    }

    @Override
    @Transactional
    public BillResponse approve(Long billId) {
        Bill bill = billRepository.findById(billId).orElseThrow(() -> new ResourceNotFoundException("Bill not found"));
        if (bill.getStatus() != BillStatus.PENDING) {
            throw new InvalidBusinessOperationException("Only pending bills can be approved");
        }
        AppUser approver = currentUser();
        bill.setStatus(BillStatus.APPROVED);
        bill.setApprovedBy(approver);
        bill.setApprovedAt(LocalDateTime.now());
        Bill saved = billRepository.save(bill);
        log.info("Bill {} approved by {}", saved.getBillReference(), approver.getEmail());
        return mapper.toBillResponse(saved);
    }

    @Override
    public Page<BillResponse> getAll(Pageable pageable) {
        return billRepository.findAll(pageable).map(mapper::toBillResponse);
    }

    @Override
    public BillResponse getByReference(String reference) {
        return mapper.toBillResponse(billRepository.findByBillReference(reference).orElseThrow(() -> new ResourceNotFoundException("Bill not found")));
    }

    @Override
    public Page<BillResponse> getByCustomer(Long customerId, Pageable pageable) {
        return billRepository.findByCustomerId(customerId, pageable).map(mapper::toBillResponse);
    }

    @Override
    public Page<BillResponse> getByMonthAndYear(Integer month, Integer year, Pageable pageable) {
        return billRepository.findByBillingMonthAndBillingYear(month, year, pageable).map(mapper::toBillResponse);
    }

    @Override
    public Page<BillResponse> getUnpaid(Pageable pageable) {
        return billRepository.findByStatusIn(List.of(BillStatus.APPROVED, BillStatus.PARTIALLY_PAID, BillStatus.OVERDUE), pageable).map(mapper::toBillResponse);
    }

    private Tariff findTariff(MeterReading reading, LocalDate cycleDate) {
        return tariffRepository.findFirstByMeterTypeAndActiveTrueAndEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(reading.getMeter().getMeterType(), cycleDate, cycleDate)
                .or(() -> tariffRepository.findFirstByMeterTypeAndActiveTrueAndEffectiveFromLessThanEqualAndEffectiveToIsNull(reading.getMeter().getMeterType(), cycleDate))
                .orElseThrow(() -> new InvalidBusinessOperationException("No active tariff found for this billing cycle"));
    }

    private BigDecimal calculateUsageCharge(BigDecimal consumption, Tariff tariff) {
        if (tariff.getTariffType() == TariffType.FLAT || tariff.getTiers().isEmpty()) {
            return consumption.multiply(tariff.getRatePerUnit());
        }
        BigDecimal total = BigDecimal.ZERO;
        for (TariffTier tier : tariff.getTiers()) {
            BigDecimal max = tier.getMaxUnit() == null ? consumption : tier.getMaxUnit();
            if (consumption.compareTo(tier.getMinUnit()) > 0) {
                BigDecimal billableUnits = consumption.min(max).subtract(tier.getMinUnit());
                if (billableUnits.compareTo(BigDecimal.ZERO) > 0) {
                    total = total.add(billableUnits.multiply(tier.getRatePerUnit()));
                }
            }
        }
        return total;
    }

    private AppUser currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
