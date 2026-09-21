package br.com.financecontrol.controller;

import br.com.financecontrol.dto.invoice.InvoiceDetailResponse;
import br.com.financecontrol.dto.invoice.InvoiceResponse;
import br.com.financecontrol.dto.invoice.PayInvoiceRequest;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/invoices")
@Tag(name = "Faturas", description = "Faturas de cartão de crédito")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    @Operation(summary = "Listar faturas com paginação")
    public ResponseEntity<Page<InvoiceResponse>> list(@AuthenticationPrincipal AuthenticatedUser user,
                                                      @PageableDefault(sort = "referenceMonth", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(invoiceService.list(user.id(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter uma fatura por id com suas parcelas")
    public ResponseEntity<InvoiceDetailResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                                     @PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.get(user.id(), id));
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "Fechar uma fatura aberta")
    public ResponseEntity<InvoiceResponse> close(@AuthenticationPrincipal AuthenticatedUser user,
                                                 @PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.close(user.id(), id));
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Pagar uma fatura fechada a partir de uma conta")
    public ResponseEntity<InvoiceResponse> pay(@AuthenticationPrincipal AuthenticatedUser user,
                                               @PathVariable UUID id,
                                               @Valid @RequestBody PayInvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.pay(user.id(), id, request.accountId()));
    }
}