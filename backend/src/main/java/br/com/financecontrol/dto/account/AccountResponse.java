package br.com.financecontrol.dto.account;

import br.com.financecontrol.entity.enums.AccountType;
import br.com.financecontrol.entity.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String name,
        AccountType type,
        BigDecimal initialBalance,
        BigDecimal balance,
        Status status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}