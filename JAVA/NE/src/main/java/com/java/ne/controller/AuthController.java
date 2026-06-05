package com.java.ne.controller;


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
import com.java.ne.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @PreAuthorize("isAnonymous()")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiMessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiMessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiMessageResponse> logout(@RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(authService.logout(authorizationHeader));
    }
}
