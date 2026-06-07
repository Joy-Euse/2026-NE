package com.java.ne.controller;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.MeterRequest;
import com.java.ne.dto.response.MeterResponse;
import com.java.ne.service.MeterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meters")
@RequiredArgsConstructor
@Tag(name = "Meters", description = "Meter creation, lookup, update, deactivation, and customer meter history endpoints.")
@Validated
public class MeterController {

    private final MeterService meterService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create meter", description = "Creates and assigns a meter. Authorized: ADMIN only.")
    public ResponseEntity<MeterResponse> create(@Valid @RequestBody MeterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meterService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE')")
    @Operation(summary = "List meters", description = "Returns all meters with pagination. Authorized: ADMIN, OPERATOR, and FINANCE.")
    public ResponseEntity<Page<MeterResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(meterService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE')")
    @Operation(summary = "Get meter by id", description = "Returns meter details by id. Authorized: ADMIN, OPERATOR, and FINANCE.")
    public ResponseEntity<MeterResponse> getById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(meterService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update meter", description = "Updates meter details. Authorized: ADMIN only.")
    public ResponseEntity<MeterResponse> update(@PathVariable @Positive Long id, @Valid @RequestBody MeterRequest request) {
        return ResponseEntity.ok(meterService.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate meter", description = "Marks a meter inactive. Authorized: ADMIN only.")
    public ResponseEntity<MeterResponse> deactivate(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(meterService.deactivate(id));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE','CUSTOMER')")
    @Operation(summary = "List customer meters", description = "Returns meters assigned to a customer. Authorized: ADMIN, OPERATOR, FINANCE, and CUSTOMER.")
    public ResponseEntity<Page<MeterResponse>> getByCustomer(@PathVariable @Positive Long customerId, Pageable pageable) {
        return ResponseEntity.ok(meterService.getByCustomer(customerId, pageable));
    }
}
