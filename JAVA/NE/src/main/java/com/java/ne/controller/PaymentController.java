package com.java.ne.controller;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.PaymentRequest;
import com.java.ne.dto.response.PaymentResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.repository.UserRepository;
import com.java.ne.service.PaymentService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment recording and payment history endpoints.")
@Validated
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('FINANCE','CUSTOMER')")
    @Operation(summary = "Record payment", description = "Records a payment against an approved, partially paid, or overdue bill. Authorized: FINANCE and CUSTOMER; customers can only pay their own bills.")
    public ResponseEntity<PaymentResponse> record(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.record(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @Operation(summary = "List payments", description = "Returns all payment records with pagination. Authorized: ADMIN and FINANCE.")
    public ResponseEntity<Page<PaymentResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAll(pageable));
    }

    @GetMapping("/bill/{billId}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE')")
    @Operation(summary = "List bill payments", description = "Returns payment records for a bill. Authorized: ADMIN and FINANCE.")
    public ResponseEntity<Page<PaymentResponse>> getByBill(@PathVariable @Positive Long billId, Pageable pageable) {
        return ResponseEntity.ok(paymentService.getByBill(billId, pageable));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE','CUSTOMER')")
    @Operation(summary = "List customer payments", description = "Returns payment history for a customer. Authorized: ADMIN, FINANCE, and CUSTOMER; customers can only view their own payment history.")
    public ResponseEntity<Page<PaymentResponse>> getByCustomer(@PathVariable @Positive Long customerId,
                                                                @AuthenticationPrincipal UserDetails userDetails,
                                                                Pageable pageable) {
        assertCustomerOwns(userDetails, customerId);
        return ResponseEntity.ok(paymentService.getByCustomer(customerId, pageable));
    }

    // -----------------------------------------------------------------------
    // helpers
    // -----------------------------------------------------------------------

    private void assertCustomerOwns(UserDetails userDetails, Long requestedCustomerId) {
        boolean isCustomerRole = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (!isCustomerRole) return;

        AppUser appUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new InvalidBusinessOperationException("Authenticated user not found"));
        if (appUser.getCustomer() == null || !appUser.getCustomer().getId().equals(requestedCustomerId)) {
            throw new InvalidBusinessOperationException("Access denied: you can only view your own payment history");
        }
    }
}
