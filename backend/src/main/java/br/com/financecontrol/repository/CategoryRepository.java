package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Category;
import br.com.financecontrol.entity.enums.CategoryType;
import br.com.financecontrol.entity.enums.Status;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @EntityGraph(attributePaths = "user")
    List<Category> findByUser_IdOrderByName(UUID userId);

    @EntityGraph(attributePaths = "user")
    List<Category> findByUser_IdAndTypeOrderByName(UUID userId, CategoryType type);

    @EntityGraph(attributePaths = "user")
    List<Category> findByUser_IdAndTypeAndStatusOrderByName(UUID userId, CategoryType type, Status status);

    @EntityGraph(attributePaths = "user")
    Optional<Category> findByUser_IdAndId(UUID userId, UUID id);
}