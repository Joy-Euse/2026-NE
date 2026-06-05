package com.java.ne.controller;

import com.java.ne.dto.response.BillResponse;
import com.java.ne.dto.response.CustomerResponse;
import com.java.ne.dto.response.PaymentResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.repository.UserRepository;
import com.java.ne.service.BillService;
import com.java.ne.service.CustomerService;
import com.java.ne.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
public class MeController {

    private final UserRepository userRepository;
    private final CustomerService customerService;
    private final BillService billService;
    private final PaymentService paymentService;

    /**
     * Returns the Customer profile linked to the authenticated ROLE_CUSTOMER account.
     */
    @GetMapping("/profile")
    public ResponseEntity<CustomerResponse> myProfile(@AuthenticationPrincipal UserDetails userDetails) {
        Long customerId = resolveCustomerId(userDetails);
        return ResponseEntity.ok(customerService.getById(customerId));
    }

    /**
     * Returns paginated bills for the authenticated customer.
     */
    @GetMapping("/bills")
    public ResponseEntity<Page<BillResponse>> myBills(@AuthenticationPrincipal UserDetails userDetails, Pageable pageable) {
        Long customerId = resolveCustomerId(userDetails);
        return ResponseEntity.ok(billService.getByCustomer(customerId, pageable));
    }

    /**
     * Returns paginated payment history for the authenticated customer.
     */
    @GetMapping("/payments")
    public ResponseEntity<Page<PaymentResponse>> myPayments(@AuthenticationPrincipal UserDetails userDetails, Pageable pageable) {
        Long customerId = resolveCustomerId(userDetails);
        return ResponseEntity.ok(paymentService.getByCustomer(customerId, pageable));
    }

    // -----------------------------------------------------------------------
    // helpers
    // -----------------------------------------------------------------------

    private Long resolveCustomerId(UserDetails userDetails) {
        AppUser appUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new InvalidBusinessOperationException("Authenticated user not found"));
        if (appUser.getCustomer() == null) {
            throw new InvalidBusinessOperationException("This account is not linked to a customer profile");
        }
        return appUser.getCustomer().getId();
    }
}
