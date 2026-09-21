package br.com.financecontrol.mapper;

import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.entity.Category;

public final class CategoryMapper {

    private CategoryMapper() {
    }

    public static CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType(),
                category.getStatus(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}