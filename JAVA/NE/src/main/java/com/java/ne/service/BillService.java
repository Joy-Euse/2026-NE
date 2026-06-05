package com.java.ne.service;

import com.java.ne.dto.request.BillGenerationRequest;
import com.java.ne.dto.response.BillResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BillService {
    BillResponse generate(BillGenerationRequest request);

    BillResponse approve(Long billId);

    Page<BillResponse> getAll(Pageable pageable);

    BillResponse getByReference(String reference);

    Page<BillResponse> getByCustomer(Long customerId, Pageable pageable);

    Page<BillResponse> getByMonthAndYear(Integer month, Integer year, Pageable pageable);

    Page<BillResponse> getUnpaid(Pageable pageable);
}
