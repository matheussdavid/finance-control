package br.com.financecontrol.dto.category;

import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.Status;

import java.time.LocalDateTime;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        CategoryType type,
        Status status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}