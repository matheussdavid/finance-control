package br.com.financecontrol.service;

import br.com.financecontrol.dto.transfer.TransferRequest;
import br.com.financecontrol.dto.transfer.TransferResponse;
import br.com.financecontrol.entity.Account;
import br.com.financecontrol.entity.Transfer;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.TransferMapper;
import br.com.financecontrol.repository.AccountRepository;
import br.com.financecontrol.repository.TransferRepository;
import br.com.financecontrol.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class TransferService {

    private final TransferRepository transferRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public TransferService(TransferRepository transferRepository,
                           AccountRepository accountRepository,
                           UserRepository userRepository) {
        this.transferRepository = transferRepository;
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransferResponse create(UUID userId, TransferRequest request) {
        Account source = accountRepository.findByUser_IdAndId(userId, request.sourceAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("account.sourceNotFound"));
        Account destination = accountRepository.findByUser_IdAndId(userId, request.destinationAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("account.destinationNotFound"));

        validateRules(source, destination);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user.notFound"));

        source.setBalance(source.getBalance().subtract(request.amount()));
        destination.setBalance(destination.getBalance().add(request.amount()));
        accountRepository.save(source);
        accountRepository.save(destination);

        Transfer transfer = new Transfer();
        transfer.setUser(user);
        transfer.setSourceAccount(source);
        transfer.setDestinationAccount(destination);
        transfer.setAmount(request.amount());
        transfer.setTransferDate(request.transferDate());
        transfer.setDescription(request.description());

        return TransferMapper.toResponse(transferRepository.save(transfer));
    }

    @Transactional(readOnly = true)
    public Page<TransferResponse> list(UUID userId, Pageable pageable) {
        return transferRepository.findByUser_Id(userId, pageable).map(TransferMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TransferResponse get(UUID userId, UUID id) {
        return transferRepository.findByUser_IdAndId(userId, id)
                .map(TransferMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("transfer.notFound"));
    }

    private void validateRules(Account source, Account destination) {
        if (source.getId().equals(destination.getId())) {
            throw new BusinessRuleException("transfer.sameAccount");
        }
        if (source.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("transfer.sourceNotActive");
        }
        if (destination.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("transfer.destinationNotActive");
        }
    }
}