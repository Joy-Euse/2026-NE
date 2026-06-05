package com.java.ne.service;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.LoginRequest;
import com.java.ne.dto.request.RegisterRequest;
import com.java.ne.dto.response.AuthResponse;
import com.java.ne.dto.response.ApiMessageResponse;
import com.java.ne.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    ApiMessageResponse logout(String authorizationHeader);
}
