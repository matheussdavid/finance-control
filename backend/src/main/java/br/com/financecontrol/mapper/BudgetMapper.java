package br.com.financecontrol.mapper;

import br.com.financecontrol.dto.budget.BudgetResponse;
import br.com.financecontrol.dto.budget.BudgetSummary;
import br.com.financecontrol.entity.Budget;

public final class BudgetMapper {

    private BudgetMapper() {
    }

    public static BudgetResponse toResponse(BudgetSummary summary) {
        Budget budget = summary.budget();
        return new BudgetResponse(
                budget.getId(),
                budget.getCategory().getId(),
                budget.getCategory().getName(),
                budget.getMonth(),
                budget.getYear(),
                budget.getAmount(),
                summary.spent(),
                summary.available(),
                budget.getCreatedAt(),
                budget.getUpdatedAt()
        );
    }
}