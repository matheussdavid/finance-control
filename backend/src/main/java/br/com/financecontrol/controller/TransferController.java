package br.com.financecontrol.controller;

import br.com.financecontrol.dto.transfer.TransferRequest;
import br.com.financecontrol.dto.transfer.TransferResponse;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.TransferService;
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
@RequestMapping("/transfers")
@Tag(name = "Transferências", description = "Transferências de dinheiro entre contas")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    @Operation(summary = "Criar uma transferência de dinheiro entre contas")
    public ResponseEntity<TransferResponse> create(@AuthenticationPrincipal AuthenticatedUser user,
                                                   @Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transferService.create(user.id(), request));
    }

    @GetMapping
    @Operation(summary = "Listar transferências com paginação")
    public ResponseEntity<Page<TransferResponse>> list(@AuthenticationPrincipal AuthenticatedUser user,
                                                       @PageableDefault(sort = "transferDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(transferService.list(user.id(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter uma transferência por id")
    public ResponseEntity<TransferResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                                @PathVariable UUID id) {
        return ResponseEntity.ok(transferService.get(user.id(), id));
    }
}