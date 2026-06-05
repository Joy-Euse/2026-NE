package com.java.ne.controller;

import com.java.ne.dto.request.BillGenerationRequest;
import com.java.ne.dto.response.BillResponse;
import com.java.ne.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<BillResponse> generate(@Valid @RequestBody BillGenerationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billService.generate(request));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<BillResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(billService.approve(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','CUSTOMER')")
    public ResponseEntity<Page<BillResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(billService.getAll(pageable));
    }

    @GetMapping("/reference/{reference}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','CUSTOMER')")
    public ResponseEntity<BillResponse> getByReference(@PathVariable String reference) {
        return ResponseEntity.ok(billService.getByReference(reference));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','CUSTOMER')")
    public ResponseEntity<Page<BillResponse>> getByCustomer(@PathVariable Long customerId, Pageable pageable) {
        return ResponseEntity.ok(billService.getByCustomer(customerId, pageable));
    }

    @GetMapping("/period")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<Page<BillResponse>> getByPeriod(@RequestParam Integer month, @RequestParam Integer year, Pageable pageable) {
        return ResponseEntity.ok(billService.getByMonthAndYear(month, year, pageable));
    }

    @GetMapping("/unpaid")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    public ResponseEntity<Page<BillResponse>> getUnpaid(Pageable pageable) {
        return ResponseEntity.ok(billService.getUnpaid(pageable));
    }
}
