package br.com.financecontrol.dto.category;

import br.com.financecontrol.entity.enums.CategoryType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @Schema(example = "Salário")
        @NotBlank(message = "name.required")
        @Size(max = 100, message = "name.tooLong")
        String name,

        @Schema(example = "INCOME")
        @NotNull(message = "type.required")
        CategoryType type
) {
}