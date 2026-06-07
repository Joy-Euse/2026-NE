package com.java.ne.controller;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.MeterReadingRequest;
import com.java.ne.dto.response.MeterReadingResponse;
import com.java.ne.service.MeterReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meter-readings")
@RequiredArgsConstructor
@Tag(name = "Meter Readings", description = "Meter reading creation and lookup endpoints.")
@Validated
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    @PostMapping
    @PreAuthorize("hasRole('OPERATOR')")
    @Operation(summary = "Create meter reading", description = "Records a new meter reading. Authorized: OPERATOR only.")
    public ResponseEntity<MeterReadingResponse> create(@Valid @RequestBody MeterReadingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(meterReadingService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE')")
    @Operation(summary = "List meter readings", description = "Returns all meter readings with pagination. Authorized: ADMIN, OPERATOR, and FINANCE.")
    public ResponseEntity<Page<MeterReadingResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(meterReadingService.getAll(pageable));
    }

    @GetMapping("/meter/{meterId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE')")
    @Operation(summary = "List meter readings by meter", description = "Returns readings for one meter. Authorized: ADMIN, OPERATOR, and FINANCE.")
    public ResponseEntity<Page<MeterReadingResponse>> getByMeter(@PathVariable @Positive Long meterId, Pageable pageable) {
        return ResponseEntity.ok(meterReadingService.getByMeter(meterId, pageable));
    }

    @GetMapping("/period")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE')")
    @Operation(summary = "List meter readings by period", description = "Returns readings for a month and year. Authorized: ADMIN, OPERATOR, and FINANCE.")
    public ResponseEntity<Page<MeterReadingResponse>> getByPeriod(@RequestParam @Min(1) @Max(12) Integer month, @RequestParam @Min(2000) Integer year, Pageable pageable) {
        return ResponseEntity.ok(meterReadingService.getByMonthAndYear(month, year, pageable));
    }
}
