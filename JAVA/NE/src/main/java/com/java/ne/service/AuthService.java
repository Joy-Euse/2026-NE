package com.java.ne.service;

import com.java.ne.dto.request.LoginRequest;
import com.java.ne.dto.request.RegisterRequest;
import com.java.ne.dto.response.AuthResponse;
import com.java.ne.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
