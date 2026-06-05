package com.java.ne.service.impl;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.MeterReadingRequest;
import com.java.ne.dto.response.MeterReadingResponse;
import com.java.ne.entity.Meter;
import com.java.ne.entity.MeterReading;
import com.java.ne.enums.MeterStatus;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.MeterReadingRepository;
import com.java.ne.repository.MeterRepository;
import com.java.ne.service.MeterReadingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeterReadingServiceImpl implements MeterReadingService {

    private final MeterRepository meterRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillingMapper mapper;

    @Override
    public MeterReadingResponse create(MeterReadingRequest request) {
        Meter meter = meterRepository.findById(request.meterId()).orElseThrow(() -> new ResourceNotFoundException("Meter not found"));
        if (meter.getStatus() != MeterStatus.ACTIVE) {
            throw new InvalidBusinessOperationException("Only active meters can receive readings");
        }
        if (request.currentReading().compareTo(request.previousReading()) <= 0) {
            throw new InvalidBusinessOperationException("Current reading must be greater than previous reading");
        }
        if (meterReadingRepository.existsByMeterIdAndReadingMonthAndReadingYear(request.meterId(), request.readingMonth(), request.readingYear())) {
            throw new DuplicateResourceException("Reading already exists for this meter and billing period");
        }
        MeterReading reading = MeterReading.builder()
                .meter(meter)
                .previousReading(request.previousReading())
                .currentReading(request.currentReading())
                .consumption(request.currentReading().subtract(request.previousReading()))
                .readingMonth(request.readingMonth())
                .readingYear(request.readingYear())
                .readingDate(request.readingDate())
                .build();
        MeterReading saved = meterReadingRepository.save(reading);
        log.info("Captured meter reading {} for meter {}", saved.getId(), meter.getMeterNumber());
        return mapper.toMeterReadingResponse(saved);
    }

    @Override
    public Page<MeterReadingResponse> getAll(Pageable pageable) {
        return meterReadingRepository.findAll(pageable).map(mapper::toMeterReadingResponse);
    }

    @Override
    public Page<MeterReadingResponse> getByMeter(Long meterId, Pageable pageable) {
        return meterReadingRepository.findByMeterId(meterId, pageable).map(mapper::toMeterReadingResponse);
    }

    @Override
    public Page<MeterReadingResponse> getByMonthAndYear(Integer month, Integer year, Pageable pageable) {
        return meterReadingRepository.findByReadingMonthAndReadingYear(month, year, pageable).map(mapper::toMeterReadingResponse);
    }
}
