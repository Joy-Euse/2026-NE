package com.java.ne.service;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.UserUpdateRequest;
import com.java.ne.dto.request.UserProfileUpdateRequest;
import com.java.ne.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> getAll(Pageable pageable);

    UserResponse getById(Long id);

    UserResponse getByEmail(String email);

    UserResponse update(Long id, UserUpdateRequest request);

    UserResponse updateProfile(String email, UserProfileUpdateRequest request);

    UserResponse deactivate(Long id);
}
