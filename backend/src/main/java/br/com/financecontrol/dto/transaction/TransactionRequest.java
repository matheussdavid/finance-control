package br.com.financecontrol.dto.transaction;

import br.com.financecontrol.entity.enums.TransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionRequest(
        @Schema(example = "INCOME")
        @NotNull(message = "type.required")
        TransactionType type,

        @Schema(example = "Salário setembro")
        @Size(max = 255, message = "description.tooLong")
        String description,

        @Schema(example = "3500.00")
        @NotNull(message = "amount.required")
        @DecimalMin(value = "0.01", message = "amount.greaterThanZero")
        BigDecimal amount,

        @NotNull(message = "accountId.required")
        UUID accountId,

        @NotNull(message = "categoryId.required")
        UUID categoryId,

        @Schema(example = "2026-09-10")
        @NotNull(message = "transactionDate.required")
        LocalDate transactionDate
) {
}