package br.com.financecontrol.dto.dashboard;

import br.com.financecontrol.dto.budget.BudgetResponse;
import br.com.financecontrol.dto.invoice.InvoiceResponse;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal totalBalance,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal totalCreditLimit,
        BigDecimal totalUsedLimit,
        BigDecimal totalAvailableLimit,
        List<CategoryExpense> expensesByCategory,
        List<BudgetResponse> budgets,
        InvoiceResponse nextInvoice
) {
}