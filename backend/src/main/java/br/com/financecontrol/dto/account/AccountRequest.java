package br.com.financecontrol.dto.account;

import br.com.financecontrol.entity.enums.AccountType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AccountRequest(
        @Schema(example = "Nubank")
        @NotBlank(message = "name.required")
        @Size(max = 100, message = "name.tooLong")
        String name,

        @Schema(example = "CHECKING")
        @NotNull(message = "type.required")
        AccountType type,

        @Schema(example = "1000.00")
        @NotNull(message = "initialBalance.required")
        @DecimalMin(value = "0.0", message = "initialBalance.notNegative")
        BigDecimal initialBalance
) {
}