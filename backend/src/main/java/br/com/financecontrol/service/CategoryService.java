package br.com.financecontrol.service;

import br.com.financecontrol.dto.category.CategoryRequest;
import br.com.financecontrol.dto.category.CategoryResponse;
import br.com.financecontrol.dto.category.CategoryUpdateRequest;
import br.com.financecontrol.entity.Category;
import br.com.financecontrol.entity.User;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.Status;
import br.com.financecontrol.exception.BusinessRuleException;
import br.com.financecontrol.exception.ResourceNotFoundException;
import br.com.financecontrol.mapper.CategoryMapper;
import br.com.financecontrol.repository.CategoryRepository;
import br.com.financecontrol.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CategoryResponse create(UUID userId, CategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("user.notFound"));
        Category category = new Category();
        category.setUser(user);
        category.setName(request.name());
        category.setType(request.type());
        category.setStatus(Status.ACTIVE);
        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(UUID userId, CategoryType type) {
        if (type != null) {
            return categoryRepository.findByUser_IdAndTypeOrderByName(userId, type).stream()
                    .map(CategoryMapper::toResponse)
                    .toList();
        }
        return categoryRepository.findByUser_IdOrderByName(userId).stream()
                .map(CategoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse get(UUID userId, UUID id) {
        return CategoryMapper.toResponse(findOwned(userId, id));
    }

    @Transactional
    public CategoryResponse update(UUID userId, UUID id, CategoryUpdateRequest request) {
        Category category = findOwned(userId, id);
        category.setName(request.name());
        category.setType(request.type());
        return CategoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deactivate(UUID userId, UUID id) {
        Category category = findOwned(userId, id);
        if (category.getStatus() == Status.INACTIVE) {
            throw new BusinessRuleException("category.alreadyInactive");
        }
        category.setStatus(Status.INACTIVE);
        categoryRepository.save(category);
    }

    public Category findOwned(UUID userId, UUID id) {
        return categoryRepository.findByUser_IdAndId(userId, id)
                .orElseThrow(() -> new ResourceNotFoundException("category.notFound"));
    }
}