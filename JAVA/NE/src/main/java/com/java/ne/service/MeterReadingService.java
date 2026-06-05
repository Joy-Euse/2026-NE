package com.java.ne.service;

import com.java.ne.dto.request.MeterReadingRequest;
import com.java.ne.dto.response.MeterReadingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MeterReadingService {
    MeterReadingResponse create(MeterReadingRequest request);

    Page<MeterReadingResponse> getAll(Pageable pageable);

    Page<MeterReadingResponse> getByMeter(Long meterId, Pageable pageable);

    Page<MeterReadingResponse> getByMonthAndYear(Integer month, Integer year, Pageable pageable);
}
