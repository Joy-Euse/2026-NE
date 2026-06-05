package com.java.ne.service;

import com.java.ne.dto.request.TariffRequest;
import com.java.ne.dto.response.TariffResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TariffService {
    TariffResponse create(TariffRequest request);

    Page<TariffResponse> getAll(Pageable pageable);

    TariffResponse getById(Long id);
}
