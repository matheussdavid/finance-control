package br.com.financecontrol.dto.budget;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        UUID categoryId,
        String categoryName,
        Integer month,
        Integer year,
        BigDecimal amount,
        BigDecimal spent,
        BigDecimal available,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}