package br.com.financecontrol.dto.auth;

import java.util.UUID;

public record UserSummary(
        UUID id,
        String name,
        String email
) {
}