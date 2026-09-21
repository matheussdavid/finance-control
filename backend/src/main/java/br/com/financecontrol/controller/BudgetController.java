package br.com.financecontrol.controller;

import br.com.financecontrol.dto.budget.BudgetRequest;
import br.com.financecontrol.dto.budget.BudgetResponse;
import br.com.financecontrol.dto.budget.BudgetUpdateRequest;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/budgets")
@Tag(name = "Orçamentos", description = "Orçamentos mensais por categoria")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Criar um orçamento")
    public ResponseEntity<BudgetResponse> create(@AuthenticationPrincipal AuthenticatedUser user,
                                                 @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(user.id(), request));
    }

    @GetMapping
    @Operation(summary = "Listar orçamentos, opcionalmente filtrados por mês/ano")
    public ResponseEntity<List<BudgetResponse>> list(@AuthenticationPrincipal AuthenticatedUser user,
                                                     @RequestParam(required = false) Integer month,
                                                     @RequestParam(required = false) Integer year) {
        if (month != null || year != null) {
            return ResponseEntity.ok(budgetService.listByPeriod(user.id(), month, year));
        }
        return ResponseEntity.ok(budgetService.list(user.id(), Pageable.unpaged()).toList());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar o valor de um orçamento")
    public ResponseEntity<BudgetResponse> update(@AuthenticationPrincipal AuthenticatedUser user,
                                                 @PathVariable UUID id,
                                                 @Valid @RequestBody BudgetUpdateRequest request) {
        return ResponseEntity.ok(budgetService.update(user.id(), id, request));
    }
}