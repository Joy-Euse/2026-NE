package com.java.ne.service;

import com.java.ne.dto.request.UserUpdateRequest;
import com.java.ne.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> getAll(Pageable pageable);

    UserResponse getById(Long id);

    UserResponse update(Long id, UserUpdateRequest request);

    UserResponse deactivate(Long id);
}
