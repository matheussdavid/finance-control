package br.com.financecontrol.dto.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BudgetUpdateRequest(
        @NotNull(message = "amount.required")
        @DecimalMin(value = "0.01", message = "amount.greaterThanZero")
        BigDecimal amount
) {
}