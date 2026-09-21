package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Transaction;
import br.com.financecontrol.entity.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND (:type IS NULL OR t.type = :type) " +
            "AND (:accountId IS NULL OR t.account.id = :accountId) " +
            "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
            "AND (:startDate IS NULL OR t.transactionDate >= :startDate) " +
            "AND (:endDate IS NULL OR t.transactionDate <= :endDate)")
    @EntityGraph(attributePaths = {"account", "category"})
    Page<Transaction> findFiltered(@Param("userId") UUID userId,
                                   @Param("type") TransactionType type,
                                   @Param("accountId") UUID accountId,
                                   @Param("categoryId") UUID categoryId,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate,
                                   Pageable pageable);

    @EntityGraph(attributePaths = {"account", "category"})
    Optional<Transaction> findByUser_IdAndId(UUID userId, UUID id);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByTypeAndPeriod(@Param("userId") UUID userId,
                                  @Param("type") TransactionType type,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT t.category.id as categoryId, SUM(t.amount) as total FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate " +
            "GROUP BY t.category.id")
    List<Object[]> sumExpenseByCategoryAndPeriod(@Param("userId") UUID userId,
                                                 @Param("type") TransactionType type,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.user.id = :userId AND t.type = :type " +
            "AND t.category.id = :categoryId " +
            "AND t.transactionDate BETWEEN :startDate AND :endDate")
    BigDecimal sumByCategoryAndPeriod(@Param("userId") UUID userId,
                                      @Param("type") TransactionType type,
                                      @Param("categoryId") UUID categoryId,
                                      @Param("startDate") LocalDate startDate,
                                      @Param("endDate") LocalDate endDate);
}