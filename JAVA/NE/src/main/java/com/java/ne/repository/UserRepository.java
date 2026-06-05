package com.java.ne.repository;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByCustomerId(Long customerId);

    Optional<AppUser> findByCustomerId(Long customerId);
}
