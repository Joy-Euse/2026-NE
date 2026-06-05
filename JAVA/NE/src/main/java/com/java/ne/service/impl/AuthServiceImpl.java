package com.java.ne.service.impl;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.LoginRequest;
import com.java.ne.dto.request.ResendOtpRequest;
import com.java.ne.dto.request.RegisterRequest;
import com.java.ne.dto.request.VerifyEmailRequest;
import com.java.ne.dto.response.ApiMessageResponse;
import com.java.ne.dto.response.AuthResponse;
import com.java.ne.dto.response.UserResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.entity.Customer;
import com.java.ne.enums.AccountStatus;
import com.java.ne.enums.Role;
import com.java.ne.exception.DuplicateResourceException;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.CustomerRepository;
import com.java.ne.repository.UserRepository;
import com.java.ne.security.JwtBlacklistService;
import com.java.ne.security.JwtTokenProvider;
import com.java.ne.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int OTP_MIN = 100000;
    private static final int OTP_RANGE = 900000;
    private static final int OTP_EXPIRY_MINUTES = 10;

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtBlacklistService jwtBlacklistService;
    private final JavaMailSender mailSender;
    private final BillingMapper mapper;

    @Value("${spring.mail.username:no-reply@utility.local}")
    private String fromAddress;

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
                .emailVerified(false)
                .otpCode(generateOtp())
                .otpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .customer(savedCustomer)
                .build();

        AppUser saved = userRepository.save(user);
        sendOtpEmail(saved);
        log.info("Registered customer account {}", saved.getEmail());
        return mapper.toUserResponse(saved);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        AppUser user = userRepository.findByEmail(request.email()).orElseThrow();
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new InvalidBusinessOperationException("Please verify your email before logging in");
        }
        String token = jwtTokenProvider.generateToken(user);
        Long customerId = user.getCustomer() == null ? null : user.getCustomer().getId();
        log.info("User login successful for {}", user.getEmail());
        return new AuthResponse(token, "Bearer", user.getId(), user.getFullName(), user.getEmail(), user.getRole(), customerId);
    }

    @Override
    public ApiMessageResponse logout(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new InvalidBusinessOperationException("Authorization bearer token is required for logout");
        }
        String token = authorizationHeader.substring(7);
        jwtBlacklistService.blacklist(token);
        SecurityContextHolder.clearContext();
        log.info("User logged out");
        return new ApiMessageResponse("Logged out successfully", LocalDateTime.now());
    }

    @Override
    @Transactional
    public ApiMessageResponse verifyEmail(VerifyEmailRequest request) {
        AppUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidBusinessOperationException("Invalid email or OTP"));
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return new ApiMessageResponse("Email is already verified", LocalDateTime.now());
        }
        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.otp())) {
            throw new InvalidBusinessOperationException("Invalid email or OTP");
        }
        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidBusinessOperationException("OTP has expired. Please request a new OTP");
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
        return new ApiMessageResponse("Email verified successfully", LocalDateTime.now());
    }

    @Override
    @Transactional
    public ApiMessageResponse resendOtp(ResendOtpRequest request) {
        AppUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidBusinessOperationException("User account not found"));
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return new ApiMessageResponse("Email is already verified", LocalDateTime.now());
        }

        user.setOtpCode(generateOtp());
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        AppUser saved = userRepository.save(user);
        sendOtpEmail(saved);
        return new ApiMessageResponse("A new OTP has been sent to your email", LocalDateTime.now());
    }

    private String generateOtp() {
        return String.valueOf(OTP_MIN + SECURE_RANDOM.nextInt(OTP_RANGE));
    }

    private void sendOtpEmail(AppUser user) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(fromAddress);
            email.setTo(user.getEmail());
            email.setSubject("Verify your Utility Billing account");
            email.setText("""
                    Dear %s,

                    Your email verification OTP is: %s

                    This OTP expires in %d minutes.
                    """.formatted(user.getFullName(), user.getOtpCode(), OTP_EXPIRY_MINUTES));
            mailSender.send(email);
            log.info("Verification OTP sent to {}", user.getEmail());
        } catch (MailException ex) {
            log.warn("Failed to send verification OTP to {}: {}", user.getEmail(), ex.getMessage());
        }
    }
}
