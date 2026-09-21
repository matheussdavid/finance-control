package br.com.financecontrol.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Schema(example = "Ana Souza")
        @NotBlank(message = "name.required")
        @Size(max = 100, message = "name.tooLong")
        String name,

        @Schema(example = "ana_souza")
        @NotBlank(message = "username.required")
        @Size(max = 100, message = "username.tooLong")
        String username,

        @Schema(example = "ana@example.com")
        @NotBlank(message = "email.required")
        @Email(message = "email.invalid")
        @Size(max = 150, message = "email.tooLong")
        String email,

        @Schema(example = "123456")
        @NotBlank(message = "password.required")
        @Size(min = 6, max = 72, message = "password.length")
        String password,

        @Schema(example = "123456")
        @NotBlank(message = "password.confirmRequired")
        @Size(min = 6, max = 72, message = "password.length")
        String confirmPassword
) {
}