package br.com.financecontrol.dto.transaction;

import br.com.financecontrol.entity.enums.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        TransactionType type,
        String description,
        BigDecimal amount,
        UUID accountId,
        String accountName,
        UUID categoryId,
        String categoryName,
        LocalDate transactionDate,
        LocalDateTime createdAt
) {
}