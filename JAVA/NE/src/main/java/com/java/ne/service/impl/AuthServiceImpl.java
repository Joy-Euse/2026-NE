package com.java.ne.service.impl;

import com.java.ne.dto.request.LoginRequest;
import com.java.ne.dto.request.RegisterRequest;
import com.java.ne.dto.response.AuthResponse;
import com.java.ne.dto.response.UserResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.enums.AccountStatus;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.UserRepository;
import com.java.ne.security.JwtTokenProvider;
import com.java.ne.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final BillingMapper mapper;

    @Override
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("User email already exists");
        }
        AppUser user = AppUser.builder()
                .fullName(request.fullName())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .password(passwordEncoder.encode(request.password()))
                .status(AccountStatus.ACTIVE)
                .role(request.role())
                .build();
        AppUser saved = userRepository.save(user);
        log.info("Registered user {}", saved.getEmail());
        return mapper.toUserResponse(saved);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        AppUser user = userRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtTokenProvider.generateToken(user);
        log.info("User login successful for {}", user.getEmail());
        return new AuthResponse(token, "Bearer", user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }
}
