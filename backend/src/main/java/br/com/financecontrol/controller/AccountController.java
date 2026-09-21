package br.com.financecontrol.controller;

import br.com.financecontrol.dto.account.AccountRequest;
import br.com.financecontrol.dto.account.AccountResponse;
import br.com.financecontrol.dto.account.AccountUpdateRequest;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
@Tag(name = "Contas", description = "Gerenciamento de contas")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    @Operation(summary = "Criar uma conta")
    public ResponseEntity<AccountResponse> create(@AuthenticationPrincipal AuthenticatedUser user,
                                                  @Valid @RequestBody AccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(user.id(), request));
    }

    @GetMapping
    @Operation(summary = "Listar contas")
    public ResponseEntity<List<AccountResponse>> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(accountService.list(user.id()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter uma conta por id")
    public ResponseEntity<AccountResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                               @PathVariable UUID id) {
        return ResponseEntity.ok(accountService.get(user.id(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar uma conta")
    public ResponseEntity<AccountResponse> update(@AuthenticationPrincipal AuthenticatedUser user,
                                                  @PathVariable UUID id,
                                                  @Valid @RequestBody AccountUpdateRequest request) {
        return ResponseEntity.ok(accountService.update(user.id(), id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Desativar uma conta (lógica)")
    public ResponseEntity<Void> deactivate(@AuthenticationPrincipal AuthenticatedUser user,
                                           @PathVariable UUID id) {
        accountService.deactivate(user.id(), id);
        return ResponseEntity.noContent().build();
    }
}