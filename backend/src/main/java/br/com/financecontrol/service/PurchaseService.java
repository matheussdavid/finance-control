package br.com.financecontrol.service;

import br.com.financecontrol.dto.purchase.PurchaseRequest;
import br.com.financecontrol.dto.purchase.PurchaseResponse;
import br.com.financecontrol.entity.Category;
import br.com.financecontrol.entity.CreditCard;
import br.com.financecontrol.entity.Invoice;
import br.com.financecontrol.entity.Installment;
import br.com.financecontrol.entity.Purchase;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.InvoiceStatus;
import br.com.financecontrol.entity.enums.InstallmentStatus;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.PurchaseMapper;
import br.com.financecontrol.repository.CategoryRepository;
import br.com.financecontrol.repository.CreditCardRepository;
import br.com.financecontrol.repository.InstallmentRepository;
import br.com.financecontrol.repository.InvoiceRepository;
import br.com.financecontrol.repository.PurchaseRepository;
import br.com.financecontrol.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final CreditCardRepository creditCardRepository;
    private final CategoryRepository categoryRepository;
    private final InvoiceRepository invoiceRepository;
    private final InstallmentRepository installmentRepository;
    private final UserRepository userRepository;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           CreditCardRepository creditCardRepository,
                           CategoryRepository categoryRepository,
                           InvoiceRepository invoiceRepository,
                           InstallmentRepository installmentRepository,
                           UserRepository userRepository) {
        this.purchaseRepository = purchaseRepository;
        this.creditCardRepository = creditCardRepository;
        this.categoryRepository = categoryRepository;
        this.invoiceRepository = invoiceRepository;
        this.installmentRepository = installmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PurchaseResponse create(UUID userId, PurchaseRequest request) {
        CreditCard card = creditCardRepository.findByUser_IdAndId(userId, request.creditCardId())
                .orElseThrow(() -> new ResourceNotFoundException("creditCard.notFound"));
        if (card.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("creditCard.notActive");
        }

        Category category = categoryRepository.findByUser_IdAndId(userId, request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("category.notFound"));
        if (category.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("category.notActive");
        }
        if (category.getType() != CategoryType.EXPENSE) {
            throw new BusinessRuleException("category.mustBeExpenseForPurchase");
        }

        BigDecimal usedLimit = installmentRepository.sumByCardAndStatus(card.getId(), InstallmentStatus.OPEN);
        if (request.totalAmount().compareTo(card.getCreditLimit().subtract(usedLimit)) > 0) {
            throw new BusinessRuleException("purchase.insufficientLimit");
        }

        BigDecimal base = request.totalAmount().divide(BigDecimal.valueOf(request.installmentsCount()), 2, RoundingMode.DOWN);
        BigDecimal remainder = request.totalAmount().subtract(base.multiply(BigDecimal.valueOf(request.installmentsCount())));

        YearMonth firstInvoiceMonth = computeFirstInvoiceMonth(card, request.purchaseDate());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user.notFound"));

        Purchase purchase = new Purchase();
        purchase.setCreditCard(card);
        purchase.setCategory(category);
        purchase.setDescription(request.description());
        purchase.setTotalAmount(request.totalAmount());
        purchase.setInstallmentsCount(request.installmentsCount());
        purchase.setPurchaseDate(request.purchaseDate());
        Purchase savedPurchase = purchaseRepository.save(purchase);

        List<Installment> savedInstallments = new ArrayList<>();

        for (int number = 1; number <= request.installmentsCount(); number++) {
            YearMonth refMonth = firstInvoiceMonth.plusMonths(number - 1L);
            Invoice invoice = getOrCreateOpenInvoice(card, refMonth);

            BigDecimal amount = (number == request.installmentsCount())
                    ? base.add(remainder)
                    : base;
            invoice.setTotalAmount(invoice.getTotalAmount().add(amount));

            Installment installment = new Installment();
            installment.setPurchase(savedPurchase);
            installment.setInvoice(invoice);
            installment.setInstallmentNumber(number);
            installment.setAmount(amount);
            installment.setStatus(InstallmentStatus.OPEN);
            savedInstallments.add(installmentRepository.save(installment));
        }

        return PurchaseMapper.toResponse(savedPurchase, savedInstallments);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseResponse> list(UUID userId, Pageable pageable) {
        return purchaseRepository.findAllByUserId(userId, pageable)
                .map(purchase -> PurchaseMapper.toResponse(
                        purchase,
                        installmentRepository.findByPurchase_Id(purchase.getId())));
    }

    @Transactional(readOnly = true)
    public PurchaseResponse get(UUID userId, UUID id) {
        Purchase purchase = purchaseRepository.findByIdAndUserId(userId, id)
                .orElseThrow(() -> new ResourceNotFoundException("purchase.notFound"));
        return PurchaseMapper.toResponse(purchase, installmentRepository.findByPurchase_Id(purchase.getId()));
    }

    private YearMonth computeFirstInvoiceMonth(CreditCard card, LocalDate purchaseDate) {
        if (purchaseDate.getDayOfMonth() <= card.getClosingDay()) {
            return YearMonth.from(purchaseDate);
        }
        return YearMonth.from(purchaseDate).plusMonths(1);
    }

    private Invoice getOrCreateOpenInvoice(CreditCard card, YearMonth refMonth) {
        LocalDate refMonthDate = refMonth.atDay(1);
        Invoice invoice = invoiceRepository.findByCreditCard_IdAndReferenceMonth(card.getId(), refMonthDate)
                .orElse(null);

        if (invoice == null) {
            invoice = new Invoice();
            invoice.setCreditCard(card);
            invoice.setReferenceMonth(refMonthDate);
            invoice.setClosingDate(withDayClamped(refMonthDate, card.getClosingDay()));
            invoice.setDueDate(withDayClamped(refMonthDate, card.getDueDay()));
            invoice.setStatus(InvoiceStatus.OPEN);
            invoice.setTotalAmount(BigDecimal.ZERO);
            return invoiceRepository.save(invoice);
        }
        if (invoice.getStatus() != InvoiceStatus.OPEN) {
            throw new BusinessRuleException("purchase.cannotAddToInvoice",
                    statusLabel(invoice.getStatus()), refMonth);
        }
        return invoice;
    }

    private String statusLabel(InvoiceStatus status) {
        return switch (status) {
            case OPEN -> "aberta";
            case CLOSED -> "fechada";
            case PAID -> "paga";
        };
    }

    private LocalDate withDayClamped(LocalDate referenceMonthDate, int day) {
        LocalDate monthStart = referenceMonthDate.withDayOfMonth(1);
        int maxDay = monthStart.lengthOfMonth();
        return monthStart.withDayOfMonth(Math.min(day, maxDay));
    }
}