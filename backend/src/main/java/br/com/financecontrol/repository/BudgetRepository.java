package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Budget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    @EntityGraph(attributePaths = "category")
    Page<Budget> findByUser_Id(UUID userId, Pageable pageable);

    @Query("SELECT b FROM Budget b WHERE b.user.id = :userId " +
            "AND (:month IS NULL OR b.month = :month) AND (:year IS NULL OR b.year = :year)")
    @EntityGraph(attributePaths = "category")
    List<Budget> findFiltered(@Param("userId") UUID userId,
                              @Param("month") Integer month,
                              @Param("year") Integer year);

    @EntityGraph(attributePaths = {"user", "category"})
    Optional<Budget> findByUser_IdAndId(UUID userId, UUID id);

    Optional<Budget> findByUser_IdAndCategory_IdAndMonthAndYear(UUID userId, UUID categoryId, Integer month, Integer year);
}