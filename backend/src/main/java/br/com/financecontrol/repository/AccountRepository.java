package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Account;
import br.com.financecontrol.entity.enums.Status;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    @EntityGraph(attributePaths = "user")
    List<Account> findByUser_IdOrderByName(UUID userId);

    @EntityGraph(attributePaths = "user")
    Optional<Account> findByUser_IdAndId(UUID userId, UUID id);

    boolean existsByUser_IdAndId(UUID userId, UUID id);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM Account a " +
            "WHERE a.user.id = :userId AND a.status = :status")
    BigDecimal sumBalanceByUserAndStatus(@Param("userId") UUID userId, @Param("status") Status status);
}