package com.java.ne.service.impl;

import com.java.ne.dto.response.UserResponse;
import com.java.ne.enums.AccountStatus;
import com.java.ne.exception.ResourceNotFoundException;
import com.java.ne.mapper.BillingMapper;
import com.java.ne.repository.UserRepository;
import com.java.ne.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
    public UserResponse deactivate(Long id) {
        var user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(AccountStatus.INACTIVE);
        return mapper.toUserResponse(userRepository.save(user));
    }
}
