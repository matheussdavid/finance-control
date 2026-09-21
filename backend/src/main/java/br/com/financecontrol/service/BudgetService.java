package br.com.financecontrol.service;

import br.com.financecontrol.dto.budget.BudgetRequest;
import br.com.financecontrol.dto.budget.BudgetResponse;
import br.com.financecontrol.dto.budget.BudgetSummary;
import br.com.financecontrol.dto.budget.BudgetUpdateRequest;
import br.com.financecontrol.entity.Budget;
import br.com.financecontrol.entity.Category;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.TransactionType;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.BudgetMapper;
import br.com.financecontrol.repository.BudgetRepository;
import br.com.financecontrol.repository.CategoryRepository;
import br.com.financecontrol.repository.InstallmentRepository;
import br.com.financecontrol.repository.TransactionRepository;
import br.com.financecontrol.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final InstallmentRepository installmentRepository;
    private final UserRepository userRepository;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository,
                         InstallmentRepository installmentRepository,
                         UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.installmentRepository = installmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BudgetResponse create(UUID userId, BudgetRequest request) {
        Category category = categoryRepository.findByUser_IdAndId(userId, request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("category.notFound"));
        if (category.getType() != CategoryType.EXPENSE) {
            throw new BusinessRuleException("category.mustBeExpenseForBudget");
        }
        if (budgetRepository.findByUser_IdAndCategory_IdAndMonthAndYear(userId, request.categoryId(), request.month(), request.year()).isPresent()) {
            throw new BusinessRuleException("budget.alreadyExists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user.notFound"));
        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonth(request.month());
        budget.setYear(request.year());
        budget.setAmount(request.amount());
        Budget saved = budgetRepository.save(budget);
        return BudgetMapper.toResponse(computeSummary(saved, userId));
    }

    @Transactional(readOnly = true)
    public Page<BudgetResponse> list(UUID userId, Pageable pageable) {
        return budgetRepository.findByUser_Id(userId, pageable)
                .map(budget -> BudgetMapper.toResponse(computeSummary(budget, userId)));
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> listByPeriod(UUID userId, Integer month, Integer year) {
        return budgetRepository.findFiltered(userId, month, year).stream()
                .map(budget -> BudgetMapper.toResponse(computeSummary(budget, userId)))
                .toList();
    }

    @Transactional
    public BudgetResponse update(UUID userId, UUID id, BudgetUpdateRequest request) {
        Budget budget = budgetRepository.findByUser_IdAndId(userId, id)
                .orElseThrow(() -> new ResourceNotFoundException("budget.notFound"));
        budget.setAmount(request.amount());
        Budget saved = budgetRepository.save(budget);
        return BudgetMapper.toResponse(computeSummary(saved, userId));
    }

    public BudgetSummary computeSummary(Budget budget, UUID userId) {
        YearMonth period = YearMonth.of(budget.getYear(), budget.getMonth());
        LocalDate start = period.atDay(1);
        LocalDate end = period.atEndOfMonth();

        BigDecimal normalExpenses = transactionRepository.sumByCategoryAndPeriod(
                userId, TransactionType.EXPENSE, budget.getCategory().getId(), start, end);
        BigDecimal cardExpenses = installmentRepository.sumByCategoryAndPeriod(
                userId, budget.getCategory().getId(), start, end);
        return new BudgetSummary(budget, normalExpenses.add(cardExpenses));
    }
}