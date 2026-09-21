package br.com.financecontrol.dto.invoice;

import br.com.financecontrol.entity.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        UUID creditCardId,
        String creditCardName,
        LocalDate referenceMonth,
        LocalDate closingDate,
        LocalDate dueDate,
        InvoiceStatus status,
        BigDecimal totalAmount,
        LocalDateTime paidAt
) {
}