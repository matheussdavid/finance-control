package br.com.financecontrol.mapper;

import br.com.financecontrol.dto.creditcard.CreditCardResponse;
import br.com.financecontrol.entity.CreditCard;

import java.math.BigDecimal;

public final class CreditCardMapper {

    private CreditCardMapper() {
    }

    public static CreditCardResponse toResponse(CreditCard card, BigDecimal usedLimit) {
        BigDecimal availableLimit = card.getCreditLimit().subtract(usedLimit);
        return new CreditCardResponse(
                card.getId(),
                card.getName(),
                card.getCreditLimit(),
                usedLimit,
                availableLimit,
                card.getClosingDay(),
                card.getDueDay(),
                card.getStatus(),
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }
}