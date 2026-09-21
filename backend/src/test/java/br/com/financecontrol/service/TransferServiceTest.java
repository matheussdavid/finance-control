package br.com.financecontrol.service;

import br.com.financecontrol.BaseServiceTest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.transfer.TransferRequest;
import br.com.financecontrol.entity.Account;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TransferServiceTest extends BaseServiceTest {

    @Autowired
    private TransferService transferService;

    @Autowired
    private br.com.financecontrol.repository.AccountRepository accountRepository;

    private final java.time.LocalDate date = java.time.LocalDate.of(2026, 9, 12);

    @Test
    void transferDebitsSourceAndCreditsDestination() {
        User user = createUser("transfer@test.dev");
        AccountResponse source = createAccount(user.getId(), "Origem", "1000.00");
        AccountResponse destination = createAccount(user.getId(), "Destino", "0.00");

        transferService.create(user.getId(), new TransferRequest(
                source.id(), destination.id(), new BigDecimal("200.00"), date, "Poupança"));

        Account sourceReloaded = accountRepository.findById(source.id()).orElseThrow();
        Account destinationReloaded = accountRepository.findById(destination.id()).orElseThrow();
        assertThat(sourceReloaded.getBalance()).isEqualByComparingTo("800.00");
        assertThat(destinationReloaded.getBalance()).isEqualByComparingTo("200.00");
    }

    @Test
    void transferBetweenSameAccountIsRejected() {
        User user = createUser("same-account@test.dev");
        AccountResponse account = createAccount(user.getId(), "Conta", "1000.00");

        assertThatThrownBy(() -> transferService.create(user.getId(), new TransferRequest(
                account.id(), account.id(), new BigDecimal("100.00"), date, null)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("transfer.sameAccount");
    }

    @Test
    void transferFromInactiveAccountIsRejected() {
        User user = createUser("inactive-source@test.dev");
        AccountResponse source = createAccount(user.getId(), "Origem", "1000.00");
        AccountResponse destination = createAccount(user.getId(), "Destino", "0.00");
        accountService.deactivate(user.getId(), source.id());

        assertThatThrownBy(() -> transferService.create(user.getId(), new TransferRequest(
                source.id(), destination.id(), new BigDecimal("100.00"), date, null)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("transfer.sourceNotActive");
    }

    @Test
    void transferCannotUseOtherUsersAccount() {
        User owner = createUser("owner-transfer@test.dev");
        User attacker = createUser("attacker-transfer@test.dev");
        AccountResponse ownerAccount = createAccount(owner.getId(), "Origem", "1000.00");
        AccountResponse attackerAccount = createAccount(attacker.getId(), "Destino", "0.00");

        assertThatThrownBy(() -> transferService.create(attacker.getId(), new TransferRequest(
                ownerAccount.id(), attackerAccount.id(), new BigDecimal("100.00"), date, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}