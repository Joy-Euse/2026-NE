package com.java.ne.repository;

import com.java.ne.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByNationalId(String nationalId);

    Page<Customer> findByFullNameContainingIgnoreCaseOrNationalIdContainingIgnoreCaseOrEmailContainingIgnoreCaseOrPhoneNumberContainingIgnoreCase(
            String fullName,
            String nationalId,
            String email,
            String phoneNumber,
            Pageable pageable
    );
}
