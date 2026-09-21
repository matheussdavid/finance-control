package br.com.financecontrol.service;

import br.com.financecontrol.BaseServiceTest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.dto.transaction.TransactionRequest;
import br.com.financecontrol.dto.transaction.TransactionResponse;
import br.com.financecontrol.entity.Account;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.entity.enums.TransactionType;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TransactionServiceTest extends BaseServiceTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private br.com.financecontrol.repository.AccountRepository accountRepository;

    @Test
    void createIncomeIncreasesBalance() {
        User user = createUser("income@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "1000.00");
        CategoryResponse category = createCategory(user.getId(), "Salário", CategoryType.INCOME);

        TransactionResponse result = transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.INCOME, "Salário", new BigDecimal("3500.00"),
                account.id(), category.id(), java.time.LocalDate.of(2026, 9, 10)));

        assertThat(result.type()).isEqualTo(TransactionType.INCOME);
        Account reloaded = accountRepository.findById(account.id()).orElseThrow();
        assertThat(reloaded.getBalance()).isEqualByComparingTo("4500.00");
    }

    @Test
    void createExpenseDecreasesBalance() {
        User user = createUser("expense@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "1000.00");
        CategoryResponse category = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);

        transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.EXPENSE, "Mercado", new BigDecimal("123.45"),
                account.id(), category.id(), java.time.LocalDate.of(2026, 9, 11)));

        Account reloaded = accountRepository.findById(account.id()).orElseThrow();
        assertThat(reloaded.getBalance()).isEqualByComparingTo("876.55");
    }

    @Test
    void balanceCanBecomeNegative() {
        User user = createUser("negative@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "10.00");
        CategoryResponse category = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);

        transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.EXPENSE, "Compras", new BigDecimal("50.00"),
                account.id(), category.id(), java.time.LocalDate.of(2026, 9, 11)));

        Account reloaded = accountRepository.findById(account.id()).orElseThrow();
        assertThat(reloaded.getBalance()).isEqualByComparingTo("-40.00");
    }

    @Test
    void incomeWithExpenseCategoryIsRejected() {
        User user = createUser("reject-cat@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "0.00");
        CategoryResponse category = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);

        assertThatThrownBy(() -> transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.INCOME, "Errado", new BigDecimal("10.00"),
                account.id(), category.id(), java.time.LocalDate.of(2026, 9, 11))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("category.mustBeIncome");
    }

    @Test
    void inactiveAccountIsRejected() {
        User user = createUser("inactive-acc@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "0.00");
        CategoryResponse category = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);
        accountService.deactivate(user.getId(), account.id());

        assertThatThrownBy(() -> transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.EXPENSE, "Compra", new BigDecimal("10.00"),
                account.id(), category.id(), java.time.LocalDate.of(2026, 9, 11))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("account.notActive");
    }

    @Test
    void inactiveCategoryIsRejected() {
        User user = createUser("inactive-cat@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "0.00");
        CategoryResponse category = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);
        categoryService.deactivate(user.getId(), category.id());

        assertThatThrownBy(() -> transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.EXPENSE, "Compra", new BigDecimal("10.00"),
                account.id(), category.id(), java.time.LocalDate.of(2026, 9, 11))))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("category.notActive");
    }

    @Test
    void otherUsersAccountIsNotVisible() {
        User owner = createUser("owner@test.dev");
        User attacker = createUser("attacker@test.dev");
        AccountResponse account = createAccount(owner.getId(), "Conta", "0.00");
        CategoryResponse category = createCategory(attacker.getId(), "Categoria", CategoryType.EXPENSE);

        assertThatThrownBy(() -> transactionService.get(attacker.getId(), account.id()))
                .isInstanceOf(ResourceNotFoundException.class);

        assertThatThrownBy(() -> transactionService.create(attacker.getId(), new TransactionRequest(
                TransactionType.EXPENSE, "Hack", new BigDecimal("10.00"),
                account.id(), category.id(), java.time.LocalDate.of(2026, 9, 11))))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void accountStatusIsActiveByDefault() {
        User user = createUser("status@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "0.00");
        assertThat(account.status()).isEqualTo(Status.ACTIVE);
    }
}