package br.com.financecontrol.service;

import br.com.financecontrol.dto.account.AccountRequest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.account.AccountUpdateRequest;
import br.com.financecontrol.entity.Account;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.AccountMapper;
import br.com.financecontrol.repository.AccountRepository;
import br.com.financecontrol.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountService(AccountRepository accountRepository, UserRepository userRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AccountResponse create(UUID userId, AccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user.notFound"));
        Account account = new Account();
        account.setUser(user);
        account.setName(request.name());
        account.setType(request.type());
        account.setInitialBalance(request.initialBalance());
        account.setBalance(request.initialBalance());
        account.setStatus(Status.ACTIVE);
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> list(UUID userId) {
        return accountRepository.findByUser_IdOrderByName(userId).stream()
                .map(AccountMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse get(UUID userId, UUID id) {
        return AccountMapper.toResponse(findOwned(userId, id));
    }

    @Transactional
    public AccountResponse update(UUID userId, UUID id, AccountUpdateRequest request) {
        Account account = findOwned(userId, id);
        account.setName(request.name());
        account.setType(request.type());
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    @Transactional
    public void deactivate(UUID userId, UUID id) {
        Account account = findOwned(userId, id);
        if (account.getStatus() == Status.INACTIVE) {
            throw new BusinessRuleException("account.alreadyInactive");
        }
        account.setStatus(Status.INACTIVE);
        accountRepository.save(account);
    }

    private Account findOwned(UUID userId, UUID id) {
        return accountRepository.findByUser_IdAndId(userId, id)
                .orElseThrow(() -> new ResourceNotFoundException("account.notFound"));
    }
}