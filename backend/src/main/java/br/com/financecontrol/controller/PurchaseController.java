package br.com.financecontrol.controller;

import br.com.financecontrol.dto.purchase.PurchaseRequest;
import br.com.financecontrol.dto.purchase.PurchaseResponse;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/purchases")
@Tag(name = "Compras", description = "Compras no cartão de crédito")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    @Operation(summary = "Criar uma compra no cartão com parcelas")
    public ResponseEntity<PurchaseResponse> create(@AuthenticationPrincipal AuthenticatedUser user,
                                                   @Valid @RequestBody PurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.create(user.id(), request));
    }

    @GetMapping
    @Operation(summary = "Listar compras com paginação")
    public ResponseEntity<Page<PurchaseResponse>> list(@AuthenticationPrincipal AuthenticatedUser user,
                                                       @PageableDefault(sort = "purchaseDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(purchaseService.list(user.id(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter uma compra por id")
    public ResponseEntity<PurchaseResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                                @PathVariable UUID id) {
        return ResponseEntity.ok(purchaseService.get(user.id(), id));
    }
}