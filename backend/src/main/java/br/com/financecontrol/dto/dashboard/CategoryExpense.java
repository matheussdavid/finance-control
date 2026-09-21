package br.com.financecontrol.dto.dashboard;

import java.math.BigDecimal;
import java.util.UUID;

public record CategoryExpense(
        UUID categoryId,
        String categoryName,
        BigDecimal total
) {
}