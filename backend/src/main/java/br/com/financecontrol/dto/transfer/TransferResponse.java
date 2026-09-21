package br.com.financecontrol.dto.transfer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TransferResponse(
        UUID id,
        UUID sourceAccountId,
        String sourceAccountName,
        UUID destinationAccountId,
        String destinationAccountName,
        BigDecimal amount,
        LocalDate transferDate,
        String description,
        LocalDateTime createdAt
) {
}