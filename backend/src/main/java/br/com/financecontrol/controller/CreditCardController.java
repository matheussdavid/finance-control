package br.com.financecontrol.controller;

import br.com.financecontrol.dto.creditcard.CreditCardRequest;
import br.com.financecontrol.dto.creditcard.CreditCardResponse;
import br.com.financecontrol.dto.creditcard.CreditCardUpdateRequest;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.CreditCardService;
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
@RequestMapping("/credit-cards")
@Tag(name = "Cartões de Crédito", description = "Gerenciamento de cartões de crédito")
public class CreditCardController {

    private final CreditCardService creditCardService;

    public CreditCardController(CreditCardService creditCardService) {
        this.creditCardService = creditCardService;
    }

    @PostMapping
    @Operation(summary = "Criar um cartão de crédito")
    public ResponseEntity<CreditCardResponse> create(@AuthenticationPrincipal AuthenticatedUser user,
                                                     @Valid @RequestBody CreditCardRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(creditCardService.create(user.id(), request));
    }

    @GetMapping
    @Operation(summary = "Listar cartões de crédito com limites usados e disponíveis")
    public ResponseEntity<List<CreditCardResponse>> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(creditCardService.list(user.id()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter um cartão de crédito por id")
    public ResponseEntity<CreditCardResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                                  @PathVariable UUID id) {
        return ResponseEntity.ok(creditCardService.get(user.id(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar um cartão de crédito")
    public ResponseEntity<CreditCardResponse> update(@AuthenticationPrincipal AuthenticatedUser user,
                                                     @PathVariable UUID id,
                                                     @Valid @RequestBody CreditCardUpdateRequest request) {
        return ResponseEntity.ok(creditCardService.update(user.id(), id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Desativar um cartão de crédito (lógica)")
    public ResponseEntity<Void> deactivate(@AuthenticationPrincipal AuthenticatedUser user,
                                           @PathVariable UUID id) {
        creditCardService.deactivate(user.id(), id);
        return ResponseEntity.noContent().build();
    }
}