package br.com.financecontrol.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Schema(example = "ana_souza")
        @NotBlank(message = "login.identifierRequired")
        String identifier,

        @Schema(example = "123456")
        @NotBlank(message = "password.required")
        String password
) {
}