package br.com.financecontrol.dto.budget;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record BudgetRequest(
        @NotNull(message = "categoryId.required")
        UUID categoryId,

        @Schema(example = "9")
        @NotNull(message = "month.required")
        @Min(value = 1, message = "month.between1and12")
        @Max(value = 12, message = "month.between1and12")
        Integer month,

        @Schema(example = "2026")
        @NotNull(message = "year.required")
        Integer year,

        @Schema(example = "800.00")
        @NotNull(message = "amount.required")
        @DecimalMin(value = "0.01", message = "amount.greaterThanZero")
        BigDecimal amount
) {
}