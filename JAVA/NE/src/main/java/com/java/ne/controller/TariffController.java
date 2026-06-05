package com.java.ne.controller;

import com.java.ne.dto.request.TariffRequest;
import com.java.ne.dto.response.TariffResponse;
import com.java.ne.service.TariffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tariffs")
@RequiredArgsConstructor
public class TariffController {

    private final TariffService tariffService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TariffResponse> create(@Valid @RequestBody TariffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tariffService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','OPERATOR')")
    public ResponseEntity<Page<TariffResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(tariffService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','OPERATOR')")
    public ResponseEntity<TariffResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tariffService.getById(id));
    }
}
