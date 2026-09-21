package br.com.financecontrol.service;

import br.com.financecontrol.BaseServiceTest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.budget.BudgetRequest;
import br.com.financecontrol.dto.budget.BudgetResponse;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.dto.creditcard.CreditCardResponse;
import br.com.financecontrol.dto.purchase.PurchaseRequest;
import br.com.financecontrol.dto.transaction.TransactionRequest;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.TransactionType;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BudgetServiceTest extends BaseServiceTest {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private CreditCardService creditCardService;

    private final LocalDate date = LocalDate.of(2026, 9, 10);

    @Test
    void budgetSpentIncludesTransactionsAndInstallments() {
        User user = createUser("budget@test.dev");
        CategoryResponse food = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);
        CategoryResponse electronics = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        AccountResponse account = createAccount(user.getId(), "Conta", "5000.00");
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));

        transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.EXPENSE, "Mercado", new BigDecimal("300.00"),
                account.id(), food.id(), date));
        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), electronics.id(), "Notebook", new BigDecimal("1200.00"), 6, date));

        BudgetResponse foodBudget = budgetService.create(user.getId(),
                new BudgetRequest(food.id(), 9, 2026, new BigDecimal("1000.00")));
        BudgetResponse electronicsBudget = budgetService.create(user.getId(),
                new BudgetRequest(electronics.id(), 9, 2026, new BigDecimal("1000.00")));

        assertThat(foodBudget.spent()).isEqualByComparingTo("300.00");
        assertThat(foodBudget.available()).isEqualByComparingTo("700.00");

        assertThat(electronicsBudget.spent()).isEqualByComparingTo("200.00");
        assertThat(electronicsBudget.available()).isEqualByComparingTo("800.00");
    }

    @Test
    void installmentOnlyConsumesBudgetInItsInvoiceMonth() {
        User user = createUser("budget-month@test.dev");
        CategoryResponse electronics = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));
        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), electronics.id(), "Notebook", new BigDecimal("1200.00"), 6, date));

        BudgetResponse sep = budgetService.create(user.getId(),
                new BudgetRequest(electronics.id(), 9, 2026, new BigDecimal("1000.00")));
        BudgetResponse oct = budgetService.create(user.getId(),
                new BudgetRequest(electronics.id(), 10, 2026, new BigDecimal("1000.00")));

        assertThat(sep.spent()).isEqualByComparingTo("200.00");
        assertThat(oct.spent()).isEqualByComparingTo("200.00");
    }

    @Test
    void duplicateBudgetIsRejected() {
        User user = createUser("budget-dup@test.dev");
        CategoryResponse food = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);
        budgetService.create(user.getId(), new BudgetRequest(food.id(), 9, 2026, new BigDecimal("500.00")));

        assertThatThrownBy(() -> budgetService.create(user.getId(),
                new BudgetRequest(food.id(), 9, 2026, new BigDecimal("600.00"))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("budget.alreadyExists");
    }

    @Test
    void budgetWithIncomeCategoryIsRejected() {
        User user = createUser("budget-income@test.dev");
        CategoryResponse salary = createCategory(user.getId(), "Salário", CategoryType.INCOME);

        assertThatThrownBy(() -> budgetService.create(user.getId(),
                new BudgetRequest(salary.id(), 9, 2026, new BigDecimal("500.00"))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("category.mustBeExpenseForBudget");
    }

    @Test
    void budgetWithOtherUsersCategoryIsRejected() {
        User owner = createUser("budget-owner@test.dev");
        User attacker = createUser("budget-attacker@test.dev");
        CategoryResponse food = createCategory(owner.getId(), "Alimentação", CategoryType.EXPENSE);

        assertThatThrownBy(() -> budgetService.create(attacker.getId(),
                new BudgetRequest(food.id(), 9, 2026, new BigDecimal("500.00"))))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void budgetOfOtherUserCannotBeUpdated() {
        User owner = createUser("budget-owner-2@test.dev");
        User attacker = createUser("budget-attacker-2@test.dev");
        CategoryResponse food = createCategory(owner.getId(), "Alimentação", CategoryType.EXPENSE);
        BudgetResponse budget = budgetService.create(owner.getId(),
                new BudgetRequest(food.id(), 9, 2026, new BigDecimal("500.00")));

        assertThatThrownBy(() -> budgetService.update(attacker.getId(), budget.id(),
                new br.com.financecontrol.dto.budget.BudgetUpdateRequest(new BigDecimal("900.00"))))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}