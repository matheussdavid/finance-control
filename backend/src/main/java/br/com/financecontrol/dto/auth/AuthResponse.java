package br.com.financecontrol.dto.auth;

public record AuthResponse(
        String token,
        UserSummary user
) {
}