package br.com.financecontrol.service;

import br.com.financecontrol.BaseServiceTest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.dto.creditcard.CreditCardResponse;
import br.com.financecontrol.dto.invoice.InvoiceDetailResponse;
import br.com.financecontrol.dto.invoice.InvoiceResponse;
import br.com.financecontrol.dto.purchase.PurchaseRequest;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.InstallmentStatus;
import br.com.financecontrol.entity.enums.InvoiceStatus;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.repository.AccountRepository;
import br.com.financecontrol.repository.InstallmentRepository;
import br.com.financecontrol.repository.InvoiceRepository;
import br.com.financecontrol.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InvoiceServiceTest extends BaseServiceTest {

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private CreditCardService creditCardService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InstallmentRepository installmentRepository;

    @Autowired
    private AccountRepository accountRepository;

    private final LocalDate purchaseDate = LocalDate.of(2026, 9, 5);
    private final LocalDate sepInvoice = LocalDate.of(2026, 9, 1);

    @Test
    void closeAndPayInvoice() {
        User user = createUser("invoice-flow@test.dev");
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));
        CategoryResponse category = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        AccountResponse account = createAccount(user.getId(), "Conta", "5000.00");

        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Notebook", new BigDecimal("1200.00"), 6, purchaseDate));

        var invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(card.id(), sepInvoice).orElseThrow();

        InvoiceResponse closed = invoiceService.close(user.getId(), invoice.getId());
        assertThat(closed.status()).isEqualTo(InvoiceStatus.CLOSED);
        assertThat(closed.totalAmount()).isEqualByComparingTo("200.00");

        InvoiceResponse paid = invoiceService.pay(user.getId(), invoice.getId(), account.id());
        assertThat(paid.status()).isEqualTo(InvoiceStatus.PAID);
        assertThat(paid.paidAt()).isNotNull();

        assertThat(accountRepository.findById(account.id()).orElseThrow().getBalance()).isEqualByComparingTo("4800.00");

        InvoiceDetailResponse detail = invoiceService.get(user.getId(), invoice.getId());
        assertThat(detail.installments()).hasSize(1);
        assertThat(detail.installments().get(0).status()).isEqualTo(InstallmentStatus.PAID);

        BigDecimal used = installmentRepository.sumByCardAndStatus(card.id(), InstallmentStatus.OPEN);
        assertThat(used).isEqualByComparingTo("1000.00");
    }

    @Test
    void payingOpenInvoiceIsRejected() {
        User user = createUser("pay-open@test.dev");
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));
        CategoryResponse category = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        AccountResponse account = createAccount(user.getId(), "Conta", "5000.00");
        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Compra", new BigDecimal("100.00"), 1, purchaseDate));

        var invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(card.id(), sepInvoice).orElseThrow();
        assertThatThrownBy(() -> invoiceService.pay(user.getId(), invoice.getId(), account.id()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("invoice.mustBeClosedToPay");
    }

    @Test
    void closingClosedInvoiceIsRejected() {
        User user = createUser("close-twice@test.dev");
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));
        CategoryResponse category = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Compra", new BigDecimal("100.00"), 1, purchaseDate));

        var invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(card.id(), sepInvoice).orElseThrow();
        invoiceService.close(user.getId(), invoice.getId());
        assertThatThrownBy(() -> invoiceService.close(user.getId(), invoice.getId()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("invoice.onlyOpenCanClose");
    }

    @Test
    void payingPaidInvoiceIsRejected() {
        User user = createUser("pay-twice@test.dev");
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));
        CategoryResponse category = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        AccountResponse account = createAccount(user.getId(), "Conta", "5000.00");
        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Compra", new BigDecimal("100.00"), 1, purchaseDate));

        var invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(card.id(), sepInvoice).orElseThrow();
        invoiceService.close(user.getId(), invoice.getId());
        invoiceService.pay(user.getId(), invoice.getId(), account.id());

        assertThatThrownBy(() -> invoiceService.pay(user.getId(), invoice.getId(), account.id()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("invoice.alreadyPaid");
    }

    @Test
    void payingWithInactiveAccountIsRejected() {
        User user = createUser("pay-inactive@test.dev");
        CreditCardResponse card = creditCardService.create(user.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));
        CategoryResponse category = createCategory(user.getId(), "Eletrônicos", CategoryType.EXPENSE);
        AccountResponse account = createAccount(user.getId(), "Conta", "5000.00");
        purchaseService.create(user.getId(), new PurchaseRequest(
                card.id(), category.id(), "Compra", new BigDecimal("100.00"), 1, purchaseDate));

        var invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(card.id(), sepInvoice).orElseThrow();
        invoiceService.close(user.getId(), invoice.getId());
        accountService.deactivate(user.getId(), account.id());

        assertThatThrownBy(() -> invoiceService.pay(user.getId(), invoice.getId(), account.id()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("account.notActive");
    }

    @Test
    void invoiceOfOtherUserIsNotVisible() {
        User owner = createUser("owner-invoice@test.dev");
        User attacker = createUser("attacker-invoice@test.dev");
        CreditCardResponse card = creditCardService.create(owner.getId(),
                new br.com.financecontrol.dto.creditcard.CreditCardRequest("Visa", new BigDecimal("3000.00"), 10, 15));
        CategoryResponse category = createCategory(owner.getId(), "Eletrônicos", CategoryType.EXPENSE);
        purchaseService.create(owner.getId(), new PurchaseRequest(
                card.id(), category.id(), "Compra", new BigDecimal("100.00"), 1, purchaseDate));

        var invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(card.id(), sepInvoice).orElseThrow();
        assertThatThrownBy(() -> invoiceService.get(attacker.getId(), invoice.getId()))
                .isInstanceOf(br.com.financecontrol.exception.ResourceNotFoundException.class);
    }
}