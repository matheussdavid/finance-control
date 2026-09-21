package br.com.financecontrol.dto.invoice;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PayInvoiceRequest(
        @Schema(example = "3f7b1c8d-...")
        @NotNull(message = "accountId.required")
        UUID accountId
) {
}