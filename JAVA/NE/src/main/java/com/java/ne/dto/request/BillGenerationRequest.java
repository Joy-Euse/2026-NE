package com.java.ne.dto.request;

import jakarta.validation.constraints.NotNull;

public record BillGenerationRequest(
        @NotNull Long meterReadingId
) {
}
