package br.com.financecontrol.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Schema(example = "Ana Souza")
        @NotBlank(message = "name.required")
        @Size(min = 2, max = 50, message = "name.tooLong")
        String name,

        @Schema(example = "ana_souza")
        @NotBlank(message = "username.required")
        @Size(min = 2, max = 50, message = "username.tooLong")
        String username,

        @Schema(example = "ana@example.com")
        @NotBlank(message = "email.required")
        @Email(message = "email.invalid")
        @Size(max = 100, message = "email.tooLong")
        String email,

        @Schema(example = "senha123")
        @NotBlank(message = "password.required")
        @Size(min = 8, max = 30, message = "password.length")
        String password,

        @Schema(example = "senha123")
        @NotBlank(message = "password.confirmRequired")
        @Size(min = 8, max = 30, message = "password.length")
        String confirmPassword
) {
}