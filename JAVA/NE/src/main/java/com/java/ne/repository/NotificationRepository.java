package com.java.ne.repository;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.entity.Notification;
import com.java.ne.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/*
 * Data access for stored customer notifications.
 */
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByCustomerId(Long customerId, Pageable pageable);

    List<Notification> findTop25ByStatusOrderByCreatedAtAsc(NotificationStatus status);
}
