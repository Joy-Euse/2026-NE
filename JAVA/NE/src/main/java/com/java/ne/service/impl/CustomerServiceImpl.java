package com.java.ne.service.impl;

import com.java.ne.dto.request.CustomerRequest;
import com.java.ne.dto.response.CustomerResponse;
import com.java.ne.entity.Customer;
import com.java.ne.enums.CustomerStatus;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.CustomerRepository;
import com.java.ne.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final BillingMapper mapper;

    @Override
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByNationalId(request.nationalId())) {
            throw new DuplicateResourceException("Customer national ID already exists");
        }
        Customer customer = Customer.builder()
                .fullName(request.fullName())
                .nationalId(request.nationalId())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .address(request.address())
                .status(CustomerStatus.ACTIVE)
                .build();
        Customer saved = customerRepository.save(customer);
        log.info("Created customer {}", saved.getNationalId());
        return mapper.toCustomerResponse(saved);
    }

    @Override
    public Page<CustomerResponse> getAll(Pageable pageable) {
        return customerRepository.findAll(pageable).map(mapper::toCustomerResponse);
    }

    @Override
    public CustomerResponse getById(Long id) {
        return mapper.toCustomerResponse(findCustomer(id));
    }

    @Override
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findCustomer(id);
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setPhoneNumber(request.phoneNumber());
        customer.setAddress(request.address());
        return mapper.toCustomerResponse(customerRepository.save(customer));
    }

    @Override
    public CustomerResponse deactivate(Long id) {
        Customer customer = findCustomer(id);
        customer.setStatus(CustomerStatus.INACTIVE);
        return mapper.toCustomerResponse(customerRepository.save(customer));
    }

    @Override
    public Page<CustomerResponse> search(String keyword, Pageable pageable) {
        String term = keyword == null ? "" : keyword;
        return customerRepository
                .findByFullNameContainingIgnoreCaseOrNationalIdContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(term, term, term, term, pageable)
                .map(mapper::toCustomerResponse);
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }
}
