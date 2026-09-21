package br.com.financecontrol.dto.creditcard;

import br.com.financecontrol.entity.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CreditCardResponse(
        UUID id,
        String name,
        BigDecimal creditLimit,
        BigDecimal usedLimit,
        BigDecimal availableLimit,
        Integer closingDay,
        Integer dueDay,
        Status status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}