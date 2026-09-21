package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {

    @Query("SELECT p FROM Purchase p JOIN p.creditCard cc WHERE cc.user.id = :userId")
    @EntityGraph(attributePaths = {"creditCard", "category"})
    Page<Purchase> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT p FROM Purchase p JOIN p.creditCard cc " +
            "WHERE cc.user.id = :userId AND p.id = :purchaseId")
    @EntityGraph(attributePaths = {"creditCard", "category"})
    Optional<Purchase> findByIdAndUserId(@Param("userId") UUID userId, @Param("purchaseId") UUID purchaseId);
}