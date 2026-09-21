package br.com.financecontrol.service;

import br.com.financecontrol.BaseServiceTest;
import br.com.financecontrol.dto.auth.AuthResponse;
import br.com.financecontrol.dto.auth.LoginRequest;
import br.com.financecontrol.dto.auth.RegisterRequest;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.InvalidCredentialsException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthServiceTest extends BaseServiceTest {

    @Autowired
    private AuthService authService;

    private RegisterRequest registerRequest() {
        return new RegisterRequest("Ana Souza", "ana_souza", "ana@example.com", "123456", "123456");
    }

    @Test
    void registerCreatesUserAndReturnsToken() {
        AuthResponse response = authService.register(registerRequest());

        assertThat(response.token()).isNotBlank();
        assertThat(response.user().name()).isEqualTo("Ana Souza");
        assertThat(response.user().email()).isEqualTo("ana@example.com");

        User saved = userRepository.findByUsername("ana_souza").orElseThrow();
        assertThat(saved.getUsername()).isEqualTo("ana_souza");
        assertThat(saved.getEmail()).isEqualTo("ana@example.com");
    }

    @Test
    void registerWithDuplicateEmailIsRejected() {
        authService.register(registerRequest());

        assertThatThrownBy(() -> authService.register(registerRequest()))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("auth.emailAlreadyRegistered");
    }

    @Test
    void registerWithDuplicateUsernameIsRejected() {
        authService.register(registerRequest());
        RegisterRequest otherEmail = new RegisterRequest("Outra Pessoa", "ana_souza",
                "outra@example.com", "123456", "123456");

        assertThatThrownBy(() -> authService.register(otherEmail))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("auth.usernameAlreadyRegistered");
    }

    @Test
    void registerWithPasswordMismatchIsRejected() {
        RegisterRequest mismatch = new RegisterRequest("Ana Souza", "ana_souza",
                "ana@example.com", "123456", "654321");

        assertThatThrownBy(() -> authService.register(mismatch))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("auth.passwordMismatch");
    }

    @Test
    void loginByIdentifier() {
        authService.register(registerRequest());

        AuthResponse byEmail = authService.login(new LoginRequest("ana@example.com", "123456"));
        assertThat(byEmail.token()).isNotBlank();

        AuthResponse byUsername = authService.login(new LoginRequest("ana_souza", "123456"));
        assertThat(byUsername.token()).isNotBlank();
        assertThat(byUsername.user().name()).isEqualTo("Ana Souza");
    }

    @Test
    void loginWithWrongPasswordIsRejected() {
        authService.register(registerRequest());

        assertThatThrownBy(() -> authService.login(new LoginRequest("ana@example.com", "wrong")))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}