package br.com.financecontrol.dto.creditcard;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreditCardUpdateRequest(
        @NotBlank(message = "name.required")
        @Size(max = 100, message = "name.tooLong")
        String name,

        @NotNull(message = "creditLimit.required")
        @DecimalMin(value = "0.01", message = "creditLimit.greaterThanZero")
        BigDecimal creditLimit,

        @NotNull(message = "closingDay.required")
        @Min(value = 1, message = "day.between1and31")
        @Max(value = 31, message = "day.between1and31")
        Integer closingDay,

        @NotNull(message = "dueDay.required")
        @Min(value = 1, message = "day.between1and31")
        @Max(value = 31, message = "day.between1and31")
        Integer dueDay
) {
}