package com.java.ne.service.impl;

import com.java.ne.dto.request.LoginRequest;
import com.java.ne.dto.request.RegisterRequest;
import com.java.ne.dto.response.AuthResponse;
import com.java.ne.dto.response.UserResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.entity.Customer;
import com.java.ne.enums.AccountStatus;
import com.java.ne.enums.Role;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.CustomerRepository;
import com.java.ne.repository.UserRepository;
import com.java.ne.security.JwtTokenProvider;
import com.java.ne.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final BillingMapper mapper;

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("User email already exists");
        }
        if (customerRepository.existsByNationalId(request.nationalId())) {
            throw new DuplicateResourceException("Customer national ID already exists");
        }

        Customer customer = Customer.builder()
                .fullName(request.fullName())
                .nationalId(request.nationalId())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .address(request.address())
                .status(com.java.ne.enums.CustomerStatus.ACTIVE)
                .build();
        Customer savedCustomer = customerRepository.save(customer);

        AppUser user = AppUser.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .password(passwordEncoder.encode(request.password()))
                .status(AccountStatus.ACTIVE)
                .role(Role.ROLE_CUSTOMER)
                .customer(savedCustomer)
                .build();

        AppUser saved = userRepository.save(user);
        log.info("Registered customer account {}", saved.getEmail());
        return mapper.toUserResponse(saved);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        AppUser user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtTokenProvider.generateToken(user);
        Long customerId = user.getCustomer() == null ? null : user.getCustomer().getId();
        log.info("User login successful for {}", user.getEmail());
        return new AuthResponse(token, "Bearer", user.getId(), user.getFullName(), user.getEmail(), user.getRole(), customerId);
    }
}
