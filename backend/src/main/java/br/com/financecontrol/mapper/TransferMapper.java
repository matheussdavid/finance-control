package br.com.financecontrol.mapper;

import br.com.financecontrol.dto.transfer.TransferResponse;
import br.com.financecontrol.entity.Transfer;

public final class TransferMapper {

    private TransferMapper() {
    }

    public static TransferResponse toResponse(Transfer transfer) {
        return new TransferResponse(
                transfer.getId(),
                transfer.getSourceAccount().getId(),
                transfer.getSourceAccount().getName(),
                transfer.getDestinationAccount().getId(),
                transfer.getDestinationAccount().getName(),
                transfer.getAmount(),
                transfer.getTransferDate(),
                transfer.getDescription(),
                transfer.getCreatedAt()
        );
    }
}