package br.com.financecontrol.mapper;

import br.com.financecontrol.dto.transaction.TransactionResponse;
import br.com.financecontrol.entity.Transaction;

public final class TransactionMapper {

    private TransactionMapper() {
    }

    public static TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getAccount().getId(),
                transaction.getAccount().getName(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getTransactionDate(),
                transaction.getCreatedAt()
        );
    }
}