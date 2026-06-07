package com.java.ne.controller;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.TariffRequest;
import com.java.ne.dto.response.TariffResponse;
import com.java.ne.service.TariffService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tariffs")
@RequiredArgsConstructor
@Tag(name = "Tariffs", description = "Tariff setup and tariff lookup endpoints.")
@Validated
public class TariffController {

    private final TariffService tariffService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create tariff", description = "Creates a utility tariff. Authorized: ADMIN only.")
    public ResponseEntity<TariffResponse> create(@Valid @RequestBody TariffRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tariffService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','OPERATOR')")
    @Operation(summary = "List tariffs", description = "Returns tariffs with pagination. Authorized: ADMIN, FINANCE, and OPERATOR.")
    public ResponseEntity<Page<TariffResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(tariffService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','OPERATOR')")
    @Operation(summary = "Get tariff by id", description = "Returns tariff details by id. Authorized: ADMIN, FINANCE, and OPERATOR.")
    public ResponseEntity<TariffResponse> getById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(tariffService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update tariff", description = "Updates tariff details. Authorized: ADMIN only.")
    public ResponseEntity<TariffResponse> update(@PathVariable @Positive Long id, @Valid @RequestBody TariffRequest request) {
        return ResponseEntity.ok(tariffService.update(id, request));
    }
}
