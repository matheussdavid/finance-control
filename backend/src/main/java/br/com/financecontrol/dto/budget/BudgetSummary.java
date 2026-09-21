package br.com.financecontrol.dto.budget;

import br.com.financecontrol.entity.Budget;

import java.math.BigDecimal;

public record BudgetSummary(
        Budget budget,
        BigDecimal spent
) {
    public BigDecimal available() {
        return budget.getAmount().subtract(spent);
    }
}