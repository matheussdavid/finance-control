package br.com.financecontrol.service;

import br.com.financecontrol.dto.invoice.InvoiceDetailResponse;
import br.com.financecontrol.dto.invoice.InvoiceResponse;
import br.com.financecontrol.entity.Account;
import br.com.financecontrol.entity.Installment;
import br.com.financecontrol.entity.Invoice;
import br.com.financecontrol.entity.enums.InstallmentStatus;
import br.com.financecontrol.entity.enums.InvoiceStatus;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.InvoiceMapper;
import br.com.financecontrol.repository.AccountRepository;
import br.com.financecontrol.repository.InstallmentRepository;
import br.com.financecontrol.repository.InvoiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InstallmentRepository installmentRepository;
    private final AccountRepository accountRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          InstallmentRepository installmentRepository,
                          AccountRepository accountRepository) {
        this.invoiceRepository = invoiceRepository;
        this.installmentRepository = installmentRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> list(UUID userId, Pageable pageable) {
        return invoiceRepository.findAllByUserId(userId, pageable).map(InvoiceMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceDetailResponse get(UUID userId, UUID id) {
        Invoice invoice = findOwned(userId, id);
        List<Installment> installments = installmentRepository.findByInvoice_Id(invoice.getId());
        return InvoiceMapper.toDetail(invoice, installments);
    }

    @Transactional
    public InvoiceResponse close(UUID userId, UUID id) {
        Invoice invoice = findOwned(userId, id);
        if (invoice.getStatus() != InvoiceStatus.OPEN) {
            throw new BusinessRuleException("invoice.onlyOpenCanClose");
        }
        BigDecimal total = installmentRepository.findByInvoice_Id(invoice.getId()).stream()
                .map(Installment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setTotalAmount(total);
        invoice.setStatus(InvoiceStatus.CLOSED);
        return InvoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    @Transactional
    public InvoiceResponse pay(UUID userId, UUID id, UUID accountId) {
        Invoice invoice = findOwned(userId, id);
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new BusinessRuleException("invoice.alreadyPaid");
        }
        if (invoice.getStatus() != InvoiceStatus.CLOSED) {
            throw new BusinessRuleException("invoice.mustBeClosedToPay");
        }

        Account account = accountRepository.findByUser_IdAndId(userId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("account.notFound"));
        if (account.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("account.notActive");
        }

        List<Installment> installments = installmentRepository.findByInvoice_Id(invoice.getId());
        installments.forEach(installment -> installment.setStatus(InstallmentStatus.PAID));
        installmentRepository.saveAll(installments);

        account.setBalance(account.getBalance().subtract(invoice.getTotalAmount()));
        accountRepository.save(account);

        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setPaidAt(LocalDateTime.now(ZoneOffset.UTC));
        return InvoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    private Invoice findOwned(UUID userId, UUID id) {
        return invoiceRepository.findByIdAndUserId(userId, id)
                .orElseThrow(() -> new ResourceNotFoundException("invoice.notFound"));
    }
}