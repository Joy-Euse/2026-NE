package com.java.ne.service;

import com.java.ne.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> getAll(Pageable pageable);

    UserResponse getById(Long id);

    UserResponse deactivate(Long id);
}
