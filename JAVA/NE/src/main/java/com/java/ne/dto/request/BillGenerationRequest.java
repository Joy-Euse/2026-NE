package com.java.ne.dto.request;


/*
 * Basic file note: this source file is part of the Utility Billing System backend.
 */
import jakarta.validation.constraints.NotNull;

public record BillGenerationRequest(
        @NotNull Long meterReadingId
) {
}
