package br.com.financecontrol.service;

import br.com.financecontrol.BaseServiceTest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.dto.creditcard.CreditCardResponse;
import br.com.financecontrol.dto.dashboard.DashboardResponse;
import br.com.financecontrol.dto.purchase.PurchaseRequest;
import br.com.financecontrol.dto.transaction.TransactionRequest;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.TransactionType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class DashboardServiceTest extends BaseServiceTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private CreditCardService creditCardService;

    @Test
    void dashboardAggregatesExistingData() {
        User user = createUser("dashboard@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "1000.00");
        CategoryResponse salary = createCategory(user.getId(), "Salário", CategoryType.INCOME);
        CategoryResponse food = createCategory(user.getId(), "Alimentação", CategoryType.EXPENSE);
        CategoryResponse electronics = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));

        transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.INCOME, "Salário", new BigDecimal("500.00"),
                account.id(), salary.id(), LocalDate.of(2026, 9, 5)));
        transactionService.create(user.getId(), new TransactionRequest(
                TransactionType.EXPENSE, "Mercado", new BigDecimal("200.00"),
                account.id(), food.id(), LocalDate.of(2026, 9, 6)));
        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), electronics.id(), "Notebook", new BigDecimal("1200.00"), 6, LocalDate.of(2026, 9, 7)));

        DashboardResponse dashboard = dashboardService.get(user.getId(), 9, 2026);

        assertThat(dashboard.totalBalance()).isEqualByComparingTo("1300.00");
        assertThat(dashboard.income()).isEqualByComparingTo("500.00");
        assertThat(dashboard.expenses()).isEqualByComparingTo("400.00");
        assertThat(dashboard.totalCreditLimit()).isEqualByComparingTo("3000.00");
        assertThat(dashboard.totalUsedLimit()).isEqualByComparingTo("1200.00");
        assertThat(dashboard.totalAvailableLimit()).isEqualByComparingTo("1800.00");
        assertThat(dashboard.expensesByCategory()).hasSize(2);
        assertThat(dashboard.nextInvoice()).isNotNull();
        assertThat(dashboard.nextInvoice().referenceMonth()).isEqualTo(LocalDate.of(2026, 9, 1));
    }
}