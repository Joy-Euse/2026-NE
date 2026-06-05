package com.java.ne.service;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.MeterRequest;
import com.java.ne.dto.response.MeterResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MeterService {
    MeterResponse create(MeterRequest request);

    Page<MeterResponse> getAll(Pageable pageable);

    MeterResponse getById(Long id);

    MeterResponse update(Long id, MeterRequest request);

    MeterResponse deactivate(Long id);

    Page<MeterResponse> getByCustomer(Long customerId, Pageable pageable);
}
