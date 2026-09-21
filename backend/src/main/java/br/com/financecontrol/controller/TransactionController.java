package br.com.financecontrol.controller;

import br.com.financecontrol.dto.transaction.TransactionRequest;
import br.com.financecontrol.dto.transaction.TransactionResponse;
import br.com.financecontrol.entity.enums.TransactionType;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/transactions")
@Tag(name = "Transações", description = "Transações de receita e despesa")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @Operation(summary = "Criar uma transação de receita ou despesa")
    public ResponseEntity<TransactionResponse> create(@AuthenticationPrincipal AuthenticatedUser user,
                                                      @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(user.id(), request));
    }

    @GetMapping
    @Operation(summary = "Listar transações com filtros e paginação")
    public ResponseEntity<Page<TransactionResponse>> list(@AuthenticationPrincipal AuthenticatedUser user,
                                                          @RequestParam(required = false) TransactionType type,
                                                          @RequestParam(required = false) UUID accountId,
                                                          @RequestParam(required = false) UUID categoryId,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                                                          @PageableDefault(sort = "transactionDate", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(transactionService.list(user.id(), type, accountId, categoryId, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter uma transação por id")
    public ResponseEntity<TransactionResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                                   @PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.get(user.id(), id));
    }
}