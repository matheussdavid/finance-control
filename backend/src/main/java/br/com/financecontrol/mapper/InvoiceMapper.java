package br.com.financecontrol.mapper;

import br.com.financecontrol.dto.invoice.InvoiceDetailResponse;
import br.com.financecontrol.dto.invoice.InvoiceInstallmentResponse;
import br.com.financecontrol.dto.invoice.InvoiceResponse;
import br.com.financecontrol.entity.Installment;
import br.com.financecontrol.entity.Invoice;

import java.util.List;

public final class InvoiceMapper {

    private InvoiceMapper() {
    }

    public static InvoiceResponse toResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getCreditCard().getId(),
                invoice.getCreditCard().getName(),
                invoice.getReferenceMonth(),
                invoice.getClosingDate(),
                invoice.getDueDate(),
                invoice.getStatus(),
                invoice.getTotalAmount(),
                invoice.getPaidAt()
        );
    }

    public static InvoiceDetailResponse toDetail(Invoice invoice, List<Installment> installments) {
        List<InvoiceInstallmentResponse> installmentResponses = installments.stream()
                .map(InvoiceMapper::toInstallmentResponse)
                .toList();
        return new InvoiceDetailResponse(
                invoice.getId(),
                invoice.getCreditCard().getId(),
                invoice.getCreditCard().getName(),
                invoice.getReferenceMonth(),
                invoice.getClosingDate(),
                invoice.getDueDate(),
                invoice.getStatus(),
                invoice.getTotalAmount(),
                invoice.getPaidAt(),
                installmentResponses
        );
    }

    public static InvoiceInstallmentResponse toInstallmentResponse(Installment installment) {
        return new InvoiceInstallmentResponse(
                installment.getId(),
                installment.getPurchase().getId(),
                installment.getPurchase().getDescription(),
                installment.getPurchase().getCategory().getId(),
                installment.getPurchase().getCategory().getName(),
                installment.getInstallmentNumber(),
                installment.getAmount(),
                installment.getStatus()
        );
    }
}