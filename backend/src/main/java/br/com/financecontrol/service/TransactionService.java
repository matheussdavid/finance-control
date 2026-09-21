package br.com.financecontrol.service;

import br.com.financecontrol.dto.transaction.TransactionRequest;
import br.com.financecontrol.dto.transaction.TransactionResponse;
import br.com.financecontrol.entity.Account;
import br.com.financecontrol.entity.Category;
import br.com.financecontrol.entity.Transaction;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.entity.enums.TransactionType;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.TransactionMapper;
import br.com.financecontrol.repository.AccountRepository;
import br.com.financecontrol.repository.CategoryRepository;
import br.com.financecontrol.repository.TransactionRepository;
import br.com.financecontrol.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              CategoryRepository categoryRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TransactionResponse create(UUID userId, TransactionRequest request) {
        Account account = accountRepository.findByUser_IdAndId(userId, request.accountId())
                .orElseThrow(() -> new ResourceNotFoundException("account.notFound"));
        Category category = categoryRepository.findByUser_IdAndId(userId, request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("category.notFound"));

        validateRules(account, category, request.type());

        Transaction transaction = new Transaction();
        transaction.setUser(account.getUser());
        transaction.setAccount(account);
        transaction.setCategory(category);
        transaction.setType(request.type());
        transaction.setDescription(request.description());
        transaction.setAmount(request.amount());
        transaction.setTransactionDate(request.transactionDate());

        adjustBalance(account, request.type(), request.amount());
        accountRepository.save(account);

        return TransactionMapper.toResponse(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> list(UUID userId,
                                          TransactionType type,
                                          UUID accountId,
                                          UUID categoryId,
                                          LocalDate startDate,
                                          LocalDate endDate,
                                          Pageable pageable) {
        return transactionRepository.findFiltered(userId, type, accountId, categoryId, startDate, endDate, pageable)
                .map(TransactionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse get(UUID userId, UUID id) {
        return transactionRepository.findByUser_IdAndId(userId, id)
                .map(TransactionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("transaction.notFound"));
    }

    private void validateRules(Account account, Category category, TransactionType type) {
        if (account.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("account.notActive");
        }
        if (category.getStatus() != Status.ACTIVE) {
            throw new BusinessRuleException("category.notActive");
        }
        if (type == TransactionType.INCOME && category.getType() != CategoryType.INCOME) {
            throw new BusinessRuleException("category.mustBeIncome");
        }
        if (type == TransactionType.EXPENSE && category.getType() != CategoryType.EXPENSE) {
            throw new BusinessRuleException("category.mustBeExpense");
        }
    }

    private void adjustBalance(Account account, TransactionType type, BigDecimal amount) {
        BigDecimal newBalance = type == TransactionType.INCOME
                ? account.getBalance().add(amount)
                : account.getBalance().subtract(amount);
        account.setBalance(newBalance);
    }
}