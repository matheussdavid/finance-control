package br.com.financecontrol.mapper;

import br.com.financecontrol.dto.purchase.InstallmentResponse;
import br.com.financecontrol.dto.purchase.PurchaseResponse;
import br.com.financecontrol.entity.Installment;
import br.com.financecontrol.entity.Purchase;

import java.util.List;

public final class PurchaseMapper {

    private PurchaseMapper() {
    }

    public static PurchaseResponse toResponse(Purchase purchase, List<Installment> installments) {
        List<InstallmentResponse> installmentResponses = installments.stream()
                .map(PurchaseMapper::toResponse)
                .toList();
        return new PurchaseResponse(
                purchase.getId(),
                purchase.getCreditCard().getId(),
                purchase.getCreditCard().getName(),
                purchase.getCategory().getId(),
                purchase.getCategory().getName(),
                purchase.getDescription(),
                purchase.getTotalAmount(),
                purchase.getInstallmentsCount(),
                purchase.getPurchaseDate(),
                purchase.getCreatedAt(),
                installmentResponses
        );
    }

    public static InstallmentResponse toResponse(Installment installment) {
        return new InstallmentResponse(
                installment.getId(),
                installment.getInvoice().getId(),
                installment.getInvoice().getReferenceMonth(),
                installment.getInstallmentNumber(),
                installment.getAmount(),
                installment.getStatus()
        );
    }
}