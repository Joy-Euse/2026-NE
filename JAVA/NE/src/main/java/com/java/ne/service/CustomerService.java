package com.java.ne.service;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.CustomerRequest;
import com.java.ne.dto.response.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    CustomerResponse create(CustomerRequest request);

    Page<CustomerResponse> getAll(Pageable pageable);

    CustomerResponse getById(Long id);

    CustomerResponse update(Long id, CustomerRequest request);

    CustomerResponse deactivate(Long id);

    Page<CustomerResponse> search(String keyword, Pageable pageable);
}
