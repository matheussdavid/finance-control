package br.com.financecontrol.service;

import br.com.financecontrol.dto.budget.BudgetResponse;
import br.com.financecontrol.dto.dashboard.CategoryExpense;
import br.com.financecontrol.dto.dashboard.DashboardResponse;
import br.com.financecontrol.entity.Category;
import br.com.financecontrol.entity.CreditCard;
import br.com.financecontrol.entity.enums.InstallmentStatus;
import br.com.financecontrol.entity.enums.InvoiceStatus;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.entity.enums.TransactionType;
import br.com.financecontrol.mapper.BudgetMapper;
import br.com.financecontrol.mapper.InvoiceMapper;
import br.com.financecontrol.repository.AccountRepository;
import br.com.financecontrol.repository.BudgetRepository;
import br.com.financecontrol.repository.CategoryRepository;
import br.com.financecontrol.repository.CreditCardRepository;
import br.com.financecontrol.repository.InstallmentRepository;
import br.com.financecontrol.repository.InvoiceRepository;
import br.com.financecontrol.repository.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class DashboardService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final InstallmentRepository installmentRepository;
    private final CreditCardRepository creditCardRepository;
    private final CategoryRepository categoryRepository;
    private final BudgetRepository budgetRepository;
    private final InvoiceRepository invoiceRepository;
    private final BudgetService budgetService;

    public DashboardService(AccountRepository accountRepository,
                            TransactionRepository transactionRepository,
                            InstallmentRepository installmentRepository,
                            CreditCardRepository creditCardRepository,
                            CategoryRepository categoryRepository,
                            BudgetRepository budgetRepository,
                            InvoiceRepository invoiceRepository,
                            BudgetService budgetService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.installmentRepository = installmentRepository;
        this.creditCardRepository = creditCardRepository;
        this.categoryRepository = categoryRepository;
        this.budgetRepository = budgetRepository;
        this.invoiceRepository = invoiceRepository;
        this.budgetService = budgetService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse get(UUID userId, Integer month, Integer year) {
        YearMonth period = YearMonth.of(year, month);
        LocalDate start = period.atDay(1);
        LocalDate end = period.atEndOfMonth();

        BigDecimal totalBalance = accountRepository.sumBalanceByUserAndStatus(userId, Status.ACTIVE);
        BigDecimal income = transactionRepository.sumByTypeAndPeriod(userId, TransactionType.INCOME, start, end);
        BigDecimal normalExpenses = transactionRepository.sumByTypeAndPeriod(userId, TransactionType.EXPENSE, start, end);
        BigDecimal cardExpenses = installmentRepository.sumCardExpensesByPeriod(userId, start, end);
        BigDecimal expenses = normalExpenses.add(cardExpenses);

        Map<String, BigDecimal> creditTotals = aggregateCreditCards(userId);

        List<CategoryExpense> expensesByCategory = aggregateExpensesByCategory(userId, start, end);

        List<BudgetResponse> budgets = budgetRepository.findFiltered(userId, month, year).stream()
                .map(budget -> BudgetMapper.toResponse(budgetService.computeSummary(budget, userId)))
                .toList();

        return new DashboardResponse(
                totalBalance,
                income,
                expenses,
                creditTotals.get("limit"),
                creditTotals.get("used"),
                creditTotals.get("available"),
                expensesByCategory,
                budgets,
                nextOpenInvoice(userId)
        );
    }

    private Map<String, BigDecimal> aggregateCreditCards(UUID userId) {
        BigDecimal totalLimit = BigDecimal.ZERO;
        BigDecimal totalUsed = BigDecimal.ZERO;
        for (CreditCard card : creditCardRepository.findByUser_IdOrderByName(userId)) {
            if (card.getStatus() == Status.ACTIVE) {
                BigDecimal used = installmentRepository.sumByCardAndStatus(card.getId(), InstallmentStatus.OPEN);
                totalLimit = totalLimit.add(card.getCreditLimit());
                totalUsed = totalUsed.add(used);
            }
        }
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        result.put("limit", totalLimit);
        result.put("used", totalUsed);
        result.put("available", totalLimit.subtract(totalUsed));
        return result;
    }

    private List<CategoryExpense> aggregateExpensesByCategory(UUID userId, LocalDate start, LocalDate end) {
        Map<UUID, BigDecimal> totals = new LinkedHashMap<>();

        for (Object[] row : transactionRepository.sumExpenseByCategoryAndPeriod(userId, TransactionType.EXPENSE, start, end)) {
            UUID categoryId = (UUID) row[0];
            totals.merge(categoryId, (BigDecimal) row[1], BigDecimal::add);
        }
        for (Object[] row : installmentRepository.sumExpenseByCategoryAndPeriod(userId, start, end)) {
            UUID categoryId = (UUID) row[0];
            totals.merge(categoryId, (BigDecimal) row[1], BigDecimal::add);
        }

        Map<UUID, String> categoryNames = new LinkedHashMap<>();
        for (Category category : categoryRepository.findByUser_IdOrderByName(userId)) {
            categoryNames.put(category.getId(), category.getName());
        }

        List<CategoryExpense> result = new ArrayList<>();
        totals.forEach((categoryId, total) -> result.add(new CategoryExpense(
                categoryId,
                categoryNames.getOrDefault(categoryId, "Desconhecida"),
                total)));
        result.sort((a, b) -> b.total().compareTo(a.total()));
        return result;
    }

    private br.com.financecontrol.dto.invoice.InvoiceResponse nextOpenInvoice(UUID userId) {
        return invoiceRepository.findFirstOpenByUserId(userId, InvoiceStatus.OPEN, PageRequest.of(0, 1)).stream()
                .findFirst()
                .map(InvoiceMapper::toResponse)
                .orElse(null);
    }
}