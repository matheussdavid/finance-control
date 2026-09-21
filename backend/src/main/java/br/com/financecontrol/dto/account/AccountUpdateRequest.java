package br.com.financecontrol.dto.account;

import br.com.financecontrol.entity.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AccountUpdateRequest(
        @NotBlank(message = "name.required")
        @Size(max = 100, message = "name.tooLong")
        String name,

        @NotNull(message = "type.required")
        AccountType type
) {
}