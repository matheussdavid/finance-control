package br.com.financecontrol.controller;

import br.com.financecontrol.dto.category.CategoryRequest;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.dto.category.CategoryUpdateRequest;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.security.AuthenticatedUser;
import br.com.financecontrol.service.CategoryService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@Tag(name = "Categorias", description = "Gerenciamento de categorias")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @Operation(summary = "Criar uma categoria")
    public ResponseEntity<CategoryResponse> create(@AuthenticationPrincipal AuthenticatedUser user,
                                                   @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(user.id(), request));
    }

    @GetMapping
    @Operation(summary = "Listar categorias (opcionalmente filtradas por tipo)")
    public ResponseEntity<List<CategoryResponse>> list(@AuthenticationPrincipal AuthenticatedUser user,
                                                       @RequestParam(required = false) CategoryType type) {
        return ResponseEntity.ok(categoryService.list(user.id(), type));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter uma categoria por id")
    public ResponseEntity<CategoryResponse> get(@AuthenticationPrincipal AuthenticatedUser user,
                                                @PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.get(user.id(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar uma categoria")
    public ResponseEntity<CategoryResponse> update(@AuthenticationPrincipal AuthenticatedUser user,
                                                   @PathVariable UUID id,
                                                   @Valid @RequestBody CategoryUpdateRequest request) {
        return ResponseEntity.ok(categoryService.update(user.id(), id, request));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Desativar uma categoria (lógica)")
    public ResponseEntity<Void> deactivate(@AuthenticationPrincipal AuthenticatedUser user,
                                           @PathVariable UUID id) {
        categoryService.deactivate(user.id(), id);
        return ResponseEntity.noContent().build();
    }
}