package br.com.financecontrol.security;

import java.util.UUID;

public record AuthenticatedUser(UUID id, String email) {
}