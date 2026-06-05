package com.java.ne.service.impl;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.MeterRequest;
import com.java.ne.dto.response.MeterResponse;
import com.java.ne.entity.Customer;
import com.java.ne.entity.Meter;
import com.java.ne.enums.CustomerStatus;
import com.java.ne.enums.MeterStatus;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.CustomerRepository;
import com.java.ne.repository.MeterRepository;
import com.java.ne.service.MeterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MeterServiceImpl implements MeterService {

    private final MeterRepository meterRepository;
    private final CustomerRepository customerRepository;
    private final BillingMapper mapper;

    @Override
    public MeterResponse create(MeterRequest request) {
        if (meterRepository.existsByMeterNumber(request.meterNumber())) {
            throw new DuplicateResourceException("Meter number already exists");
        }
        Customer customer = customerRepository.findById(request.customerId()).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        if (customer.getStatus() != CustomerStatus.ACTIVE) {
            throw new InvalidBusinessOperationException("Inactive customer cannot receive a meter");
        }
        Meter meter = Meter.builder()
                .meterNumber(request.meterNumber())
                .meterType(request.meterType())
                .installationDate(request.installationDate())
                .status(MeterStatus.ACTIVE)
                .customer(customer)
                .build();
        return mapper.toMeterResponse(meterRepository.save(meter));
    }

    @Override
    public Page<MeterResponse> getAll(Pageable pageable) {
        return meterRepository.findAll(pageable).map(mapper::toMeterResponse);
    }

    @Override
    public MeterResponse getById(Long id) {
        return mapper.toMeterResponse(findMeter(id));
    }

    @Override
    public MeterResponse update(Long id, MeterRequest request) {
        Meter meter = findMeter(id);
        Customer customer = customerRepository.findById(request.customerId()).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        meter.setMeterType(request.meterType());
        meter.setInstallationDate(request.installationDate());
        meter.setCustomer(customer);
        return mapper.toMeterResponse(meterRepository.save(meter));
    }

    @Override
    public MeterResponse deactivate(Long id) {
        Meter meter = findMeter(id);
        meter.setStatus(MeterStatus.INACTIVE);
        return mapper.toMeterResponse(meterRepository.save(meter));
    }

    @Override
    public Page<MeterResponse> getByCustomer(Long customerId, Pageable pageable) {
        return meterRepository.findByCustomerId(customerId, pageable).map(mapper::toMeterResponse);
    }

    private Meter findMeter(Long id) {
        return meterRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Meter not found"));
    }
}
