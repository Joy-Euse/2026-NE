package com.java.ne.controller;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.CustomerRequest;
import com.java.ne.dto.response.CustomerResponse;
import com.java.ne.service.CustomerService;
import com.java.ne.util.PageableUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer profile search, lookup, update, and deactivation endpoints.")
@Validated
public class CustomerController {

    private static final java.util.Set<String> CUSTOMER_SORT_FIELDS = java.util.Set.of(
            "id", "fullName", "nationalId", "email", "phoneNumber", "address", "status", "createdAt", "updatedAt"
    );

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE')")
    @Operation(summary = "List customers", description = "Returns customer records with pagination. Authorized: ADMIN, OPERATOR, and FINANCE.")
    public ResponseEntity<Page<CustomerResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(customerService.getAll(PageableUtils.allowOnly(pageable, CUSTOMER_SORT_FIELDS, "id")));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE','CUSTOMER')")
    @Operation(summary = "Get customer by id", description = "Returns a customer profile by id. Authorized: ADMIN, OPERATOR, FINANCE, and CUSTOMER.")
    public ResponseEntity<CustomerResponse> getById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update customer", description = "Updates a customer profile. Authorized: ADMIN only.")
    public ResponseEntity<CustomerResponse> update(@PathVariable @Positive Long id, @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.update(id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate customer", description = "Marks a customer profile inactive. Authorized: ADMIN only.")
    public ResponseEntity<CustomerResponse> deactivate(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(customerService.deactivate(id));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','FINANCE')")
    @Operation(summary = "Search customers", description = "Searches customer records by keyword. Authorized: ADMIN, OPERATOR, and FINANCE.")
    public ResponseEntity<Page<CustomerResponse>> search(@RequestParam @NotBlank String keyword, Pageable pageable) {
        return ResponseEntity.ok(customerService.search(keyword, PageableUtils.allowOnly(pageable, CUSTOMER_SORT_FIELDS, "id")));
    }
}
