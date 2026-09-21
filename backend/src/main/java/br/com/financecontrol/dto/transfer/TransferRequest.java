package br.com.financecontrol.dto.transfer;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransferRequest(
        @NotNull(message = "sourceAccountId.required")
        UUID sourceAccountId,

        @NotNull(message = "destinationAccountId.required")
        UUID destinationAccountId,

        @Schema(example = "200.00")
        @NotNull(message = "amount.required")
        @DecimalMin(value = "0.01", message = "amount.greaterThanZero")
        BigDecimal amount,

        @Schema(example = "2026-09-12")
        @NotNull(message = "transferDate.required")
        LocalDate transferDate,

        @Size(max = 255, message = "description.tooLong")
        String description
) {
}