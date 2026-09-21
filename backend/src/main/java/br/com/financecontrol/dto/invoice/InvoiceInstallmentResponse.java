package br.com.financecontrol.dto.invoice;

import br.com.financecontrol.entity.enums.InstallmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InvoiceInstallmentResponse(
        UUID installmentId,
        UUID purchaseId,
        String purchaseDescription,
        UUID categoryId,
        String categoryName,
        Integer number,
        BigDecimal amount,
        InstallmentStatus status
) {
}