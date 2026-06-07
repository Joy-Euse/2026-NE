package com.java.ne.controller;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.request.UserProfileUpdateRequest;
import com.java.ne.dto.response.BillResponse;
import com.java.ne.dto.response.PaymentResponse;
import com.java.ne.dto.response.UserResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.exception.InvalidBusinessOperationException;
import com.java.ne.repository.UserRepository;
import com.java.ne.service.BillService;
import com.java.ne.service.PaymentService;
import com.java.ne.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
@Tag(name = "My Account", description = "Self-service endpoints for the authenticated user's profile, bills, and payments.")
public class MeController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final BillService billService;
    private final PaymentService paymentService;

    @GetMapping("/profile")
    @Operation(summary = "Get my profile", description = "Returns the authenticated user's profile. Authorized: authenticated users.")
    public ResponseEntity<UserResponse> myProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getByEmail(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update my profile", description = "Updates the authenticated user's own profile. Authorized: authenticated users.")
    public ResponseEntity<UserResponse> updateMyProfile(@AuthenticationPrincipal UserDetails userDetails,
                                                        @Valid @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    /**
     * Returns paginated bills for the authenticated customer.
     */
    @GetMapping("/bills")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "List my bills", description = "Returns bills for the authenticated customer account. Authorized: CUSTOMER only.")
    public ResponseEntity<Page<BillResponse>> myBills(@AuthenticationPrincipal UserDetails userDetails, Pageable pageable) {
        Long customerId = resolveCustomerId(userDetails);
        return ResponseEntity.ok(billService.getByCustomer(customerId, pageable));
    }

    /**
     * Returns paginated payment history for the authenticated customer.
     */
    @GetMapping("/payments")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "List my payments", description = "Returns payment history for the authenticated customer account. Authorized: CUSTOMER only.")
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
