package com.java.ne.util;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public final class PageableUtils {

    private PageableUtils() {
    }

    public static Pageable allowOnly(Pageable pageable, Set<String> allowedProperties, String defaultProperty) {
        Sort validSort = Sort.by(pageable.getSort().stream()
                .filter(order -> allowedProperties.contains(order.getProperty()))
                .toList());

        if (validSort.isUnsorted()) {
            validSort = Sort.by(Sort.Direction.ASC, defaultProperty);
        }

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), validSort);
    }
}
