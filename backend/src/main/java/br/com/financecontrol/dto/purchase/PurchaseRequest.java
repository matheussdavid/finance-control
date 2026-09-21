package br.com.financecontrol.dto.purchase;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PurchaseRequest(
        @NotNull(message = "creditCardId.required")
        UUID creditCardId,

        @NotNull(message = "categoryId.required")
        UUID categoryId,

        @Schema(example = "Notebook")
        @Size(max = 255, message = "description.tooLong")
        String description,

        @Schema(example = "1200.00")
        @NotNull(message = "totalAmount.required")
        @DecimalMin(value = "0.01", message = "totalAmount.greaterThanZero")
        BigDecimal totalAmount,

        @Schema(example = "6")
        @NotNull(message = "installmentsCount.required")
        @Min(value = 1, message = "installmentsCount.atLeastOne")
        Integer installmentsCount,

        @Schema(example = "2026-09-05")
        @NotNull(message = "purchaseDate.required")
        LocalDate purchaseDate
) {
}