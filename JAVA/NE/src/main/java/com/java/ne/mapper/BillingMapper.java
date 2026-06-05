package com.java.ne.mapper;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import com.java.ne.dto.response.BillResponse;
import com.java.ne.dto.response.CustomerResponse;
import com.java.ne.dto.response.MeterReadingResponse;
import com.java.ne.dto.response.MeterResponse;
import com.java.ne.dto.response.NotificationResponse;
import com.java.ne.dto.response.PaymentResponse;
import com.java.ne.dto.response.TariffResponse;
import com.java.ne.dto.response.TariffTierResponse;
import com.java.ne.dto.response.UserResponse;
import com.java.ne.entity.AppUser;
import com.java.ne.entity.Bill;
import com.java.ne.entity.Customer;
import com.java.ne.entity.Meter;
import com.java.ne.entity.MeterReading;
import com.java.ne.entity.Notification;
import com.java.ne.entity.Payment;
import com.java.ne.entity.Tariff;
import com.java.ne.entity.TariffTier;
import org.springframework.stereotype.Component;

@Component
public class BillingMapper {

    public UserResponse toUserResponse(AppUser user) {
        Long customerId = user.getCustomer() == null ? null : user.getCustomer().getId();
        String address = user.getCustomer() == null ? null : user.getCustomer().getAddress();
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhoneNumber(), user.getStatus(), user.getRole(), customerId, address, user.getCreatedAt(), user.getUpdatedAt());
    }

    public CustomerResponse toCustomerResponse(Customer customer) {
        return new CustomerResponse(customer.getId(), customer.getFullName(), customer.getNationalId(), customer.getEmail(), customer.getPhoneNumber(), customer.getAddress(), customer.getStatus(), customer.getCreatedAt(), customer.getUpdatedAt());
    }

    public MeterResponse toMeterResponse(Meter meter) {
        return new MeterResponse(meter.getId(), meter.getMeterNumber(), meter.getMeterType(), meter.getInstallationDate(), meter.getStatus(), meter.getCustomer().getId(), meter.getCustomer().getFullName(), meter.getCreatedAt(), meter.getUpdatedAt());
    }

    public MeterReadingResponse toMeterReadingResponse(MeterReading reading) {
        return new MeterReadingResponse(reading.getId(), reading.getMeter().getId(), reading.getMeter().getMeterNumber(), reading.getPreviousReading(), reading.getCurrentReading(), reading.getConsumption(), reading.getReadingMonth(), reading.getReadingYear(), reading.getReadingDate(), reading.getCreatedAt(), reading.getUpdatedAt());
    }

    public TariffResponse toTariffResponse(Tariff tariff) {
        return new TariffResponse(
                tariff.getId(),
                tariff.getMeterType(),
                tariff.getTariffType(),
                tariff.getRatePerUnit(),
                tariff.getFixedCharge(),
                tariff.getVatPercentage(),
                tariff.getPenaltyPercentage(),
                tariff.getEffectiveFrom(),
                tariff.getEffectiveTo(),
                tariff.isActive(),
                tariff.getTiers().stream().map(this::toTariffTierResponse).toList(),
                tariff.getCreatedAt(),
                tariff.getUpdatedAt()
        );
    }

    public TariffTierResponse toTariffTierResponse(TariffTier tier) {
        return new TariffTierResponse(tier.getId(), tier.getMinUnit(), tier.getMaxUnit(), tier.getRatePerUnit());
    }

    public BillResponse toBillResponse(Bill bill) {
        String approvedBy = bill.getApprovedBy() == null ? null : bill.getApprovedBy().getEmail();
        return new BillResponse(
                bill.getId(),
                bill.getBillReference(),
                bill.getCustomer().getId(),
                bill.getCustomer().getFullName(),
                bill.getMeter().getId(),
                bill.getMeter().getMeterNumber(),
                bill.getMeter().getMeterType(),
                bill.getMeterReading().getId(),
                bill.getBillingMonth(),
                bill.getBillingYear(),
                bill.getConsumption(),
                bill.getAmountBeforeTax(),
                bill.getFixedCharge(),
                bill.getTaxAmount(),
                bill.getPenaltyAmount(),
                bill.getTotalAmount(),
                bill.getAmountPaid(),
                bill.getOutstandingBalance(),
                bill.getStatus(),
                bill.getDueDate(),
                approvedBy,
                bill.getApprovedAt(),
                bill.getCreatedAt(),
                bill.getUpdatedAt()
        );
    }

    public PaymentResponse toPaymentResponse(Payment payment) {
        return new PaymentResponse(payment.getId(), payment.getPaymentReference(), payment.getBill().getId(), payment.getBill().getBillReference(), payment.getAmountPaid(), payment.getPaymentMethod(), payment.getPaymentDate(), payment.getRecordedBy().getEmail(), payment.getCreatedAt(), payment.getUpdatedAt());
    }

    public NotificationResponse toNotificationResponse(Notification notification) {
        String billReference = notification.getBill() == null ? null : notification.getBill().getBillReference();
        Long billId = notification.getBill() == null ? null : notification.getBill().getId();
        return new NotificationResponse(notification.getId(), notification.getCustomer().getId(), notification.getCustomer().getFullName(), billId, billReference, notification.getMessage(), notification.getStatus(), notification.getCreatedAt(), notification.getSentAt());
    }
}
