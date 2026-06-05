package com.java.ne.service.impl;

import com.java.ne.dto.request.UserUpdateRequest;
import com.java.ne.dto.response.UserResponse;
import com.java.ne.enums.AccountStatus;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.UserRepository;
import com.java.ne.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final BillingMapper mapper;

    @Override
    public Page<UserResponse> getAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(mapper::toUserResponse);
    }

    @Override
    public UserResponse getById(Long id) {
        return mapper.toUserResponse(userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        var user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.email() != null && !request.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new DuplicateResourceException("User email already exists");
            }
            user.setEmail(request.email());
        }
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.phoneNumber() != null) {
            user.setPhoneNumber(request.phoneNumber());
        }
        if (request.status() != null) {
            user.setStatus(request.status());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }

        if (user.getCustomer() != null) {
            syncCustomerProfile(user, request);
        } else if (request.role() == com.java.ne.enums.Role.ROLE_CUSTOMER) {
            throw new InvalidBusinessOperationException("Cannot make this user ROLE_CUSTOMER because no customer profile is linked");
        }

        return mapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse deactivate(Long id) {
        var user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(AccountStatus.INACTIVE);
        return mapper.toUserResponse(userRepository.save(user));
    }

    private void syncCustomerProfile(com.java.ne.entity.AppUser user, UserUpdateRequest request) {
        var customer = user.getCustomer();
        if (request.fullName() != null) {
            customer.setFullName(request.fullName());
        }
        if (request.email() != null) {
            customer.setEmail(request.email());
        }
        if (request.phoneNumber() != null) {
            customer.setPhoneNumber(request.phoneNumber());
        }
        if (request.address() != null) {
            customer.setAddress(request.address());
        }
        if (request.status() != null) {
            customer.setStatus(request.status() == AccountStatus.ACTIVE
                    ? com.java.ne.enums.CustomerStatus.ACTIVE
                    : com.java.ne.enums.CustomerStatus.INACTIVE);
        }
    }
}
