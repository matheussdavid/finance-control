package br.com.financecontrol.service;

import br.com.financecontrol.BaseServiceTest;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.dto.creditcard.CreditCardResponse;
import br.com.financecontrol.dto.purchase.PurchaseRequest;
import br.com.financecontrol.dto.purchase.PurchaseResponse;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.InvoiceStatus;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.repository.InvoiceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PurchaseServiceTest extends BaseServiceTest {

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private CreditCardService creditCardService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private br.com.financecontrol.repository.InstallmentRepository installmentRepository;

    @Autowired
    private InvoiceService invoiceService;

    private final java.time.LocalDate purchaseDate = java.time.LocalDate.of(2026, 9, 5);

    private CreditCardResponse createCard(User user, String limit, int closingDay, int dueDay) {
        return creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal(limit), closingDay, dueDay));
    }

    @Test
    void installmentPurchaseCreatesSixInstallmentsAndCommitsFullLimit() {
        User user = createUser("purchase@test.dev");
        CreditCardResponse card = createCard(user, "3000.00", 10, 15);
        CategoryResponse category = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);

        PurchaseResponse purchase = purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Notebook", new BigDecimal("1200.00"), 6, purchaseDate));

        assertThat(purchase.installments()).hasSize(6);
        assertThat(purchase.installments()).allSatisfy(i -> {
            assertThat(i.amount()).isEqualByComparingTo("200.00");
            assertThat(i.status()).isEqualTo(br.com.financecontrol.entity.enums.InstallmentStatus.OPEN);
        });
        assertThat(purchase.installments().get(0).referenceMonth()).isEqualTo(java.time.LocalDate.of(2026, 9, 1));
        assertThat(purchase.installments().get(5).referenceMonth()).isEqualTo(java.time.LocalDate.of(2027, 2, 1));

        BigDecimal usedLimit = installmentRepository.sumByCardAndStatus(card.id(),
                br.com.financecontrol.entity.enums.InstallmentStatus.OPEN);
        assertThat(usedLimit).isEqualByComparingTo("1200.00");

        CreditCardResponse reloaded = creditCardService.get(user.getId(), card.id());
        assertThat(reloaded.availableLimit()).isEqualByComparingTo("1800.00");
    }

    @Test
    void roundingDifferenceGoesToLastInstallment() {
        User user = createUser("rounding@test.dev");
        CreditCardResponse card = createCard(user, "300.00", 10, 15);
        CategoryResponse category = createCategory(user.getId(), "Lazer", CategoryType.EXPENSE);

        PurchaseResponse purchase = purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Restaurante", new BigDecimal("100.00"), 3, purchaseDate));

        assertThat(purchase.installments()).extracting(i -> i.amount().toPlainString())
                .containsExactly("33.33", "33.33", "33.34");

        BigDecimal sum = purchase.installments().stream()
                .map(dto -> dto.amount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(sum).isEqualByComparingTo("100.00");
    }

    @Test
    void purchaseOnClosingDayBelongsToSameMonth() {
        User user = createUser("closing-boundary@test.dev");
        CreditCardResponse card = createCard(user, "3000.00", 10, 15);
        CategoryResponse category = createCategory(user.getId(), "Compras", CategoryType.EXPENSE);

        PurchaseResponse onClosingDay = purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "No dia do fechamento", new BigDecimal("100.00"), 1,
                java.time.LocalDate.of(2026, 9, 10)));
        PurchaseResponse afterClosing = purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Após fechamento", new BigDecimal("100.00"), 1,
                java.time.LocalDate.of(2026, 9, 11)));

        assertThat(onClosingDay.installments().get(0).referenceMonth()).isEqualTo(java.time.LocalDate.of(2026, 9, 1));
        assertThat(afterClosing.installments().get(0).referenceMonth()).isEqualTo(java.time.LocalDate.of(2026, 10, 1));
    }

    @Test
    void purchaseOnClosedInvoiceIsRejected() {
        User user = createUser("closed-invoice@test.dev");
        CreditCardResponse card = createCard(user, "3000.00", 10, 15);
        CategoryResponse category = createCategory(user.getId(), "Compras", CategoryType.EXPENSE);

        PurchaseResponse first = purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Primeira", new BigDecimal("100.00"), 1, purchaseDate));

        var invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(
                        card.id(), java.time.LocalDate.of(2026, 9, 1))
                .orElseThrow();
        invoiceService.close(user.getId(), invoice.getId());
        assertThat(invoiceRepository.findById(invoice.getId()).orElseThrow().getStatus()).isEqualTo(InvoiceStatus.CLOSED);

        assertThatThrownBy(() -> purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Histórica", new BigDecimal("50.00"), 1, purchaseDate)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("purchase.cannotAddToInvoice");
    }

    @Test
    void purchaseExceedingLimitIsRejected() {
        User user = createUser("no-limit@test.dev");
        CreditCardResponse card = createCard(user, "500.00", 10, 15);
        CategoryResponse category = createCategory(user.getId(), "Compras", CategoryType.EXPENSE);

        assertThatThrownBy(() -> purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Caro demais", new BigDecimal("600.00"), 1, purchaseDate)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("purchase.insufficientLimit");
    }

    @Test
    void purchaseWithIncomeCategoryIsRejected() {
        User user = createUser("income-purchase@test.dev");
        CreditCardResponse card = createCard(user, "3000.00", 10, 15);
        CategoryResponse category = createCategory(user.getId(), "Salário", CategoryType.INCOME);

        assertThatThrownBy(() -> purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Compra", new BigDecimal("100.00"), 1, purchaseDate)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("category.mustBeExpenseForPurchase");
    }

    @Test
    void purchaseWithOtherUsersCardIsRejected() {
        User owner = createUser("owner-card@test.dev");
        User attacker = createUser("attacker-card@test.dev");
        CreditCardResponse card = createCard(owner, "3000.00", 10, 15);
        CategoryResponse category = createCategory(attacker.getId(), "Compras", CategoryType.EXPENSE);

        assertThatThrownBy(() -> purchaseService.create(attacker.getId(), new PurchaseRequest(
                card.id(), category.id(), "Compra", new BigDecimal("100.00"), 1, purchaseDate)))
                .isInstanceOf(br.com.financecontrol.exception.ResourceNotFoundException.class);
    }
}