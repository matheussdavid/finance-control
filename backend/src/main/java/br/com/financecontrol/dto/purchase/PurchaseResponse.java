package br.com.financecontrol.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PurchaseResponse(
        UUID id,
        UUID creditCardId,
        String creditCardName,
        UUID categoryId,
        String categoryName,
        String description,
        BigDecimal totalAmount,
        Integer installmentsCount,
        LocalDate purchaseDate,
        LocalDateTime createdAt,
        List<InstallmentResponse> installments
) {
}