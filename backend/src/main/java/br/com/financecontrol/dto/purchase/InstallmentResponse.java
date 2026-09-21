package br.com.financecontrol.dto.purchase;

import br.com.financecontrol.entity.enums.InstallmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InstallmentResponse(
        UUID id,
        UUID invoiceId,
        LocalDate referenceMonth,
        Integer number,
        BigDecimal amount,
        InstallmentStatus status
) {
}