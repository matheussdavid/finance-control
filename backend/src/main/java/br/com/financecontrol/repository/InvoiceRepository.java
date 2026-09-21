package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Invoice;
import br.com.financecontrol.entity.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("SELECT inv FROM Invoice inv JOIN inv.creditCard cc WHERE cc.user.id = :userId")
    @EntityGraph(attributePaths = "creditCard")
    Page<Invoice> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT inv FROM Invoice inv JOIN inv.creditCard cc " +
            "WHERE cc.user.id = :userId AND inv.id = :invoiceId")
    @EntityGraph(attributePaths = "creditCard")
    Optional<Invoice> findByIdAndUserId(@Param("userId") UUID userId, @Param("invoiceId") UUID invoiceId);

    Optional<Invoice> findByCreditCard_IdAndReferenceMonth(UUID creditCardId, LocalDate referenceMonth);

    @Query("SELECT inv FROM Invoice inv JOIN inv.creditCard cc " +
            "WHERE cc.user.id = :userId AND inv.status = :status " +
            "ORDER BY inv.referenceMonth ASC")
    @EntityGraph(attributePaths = "creditCard")
    List<Invoice> findFirstOpenByUserId(@Param("userId") UUID userId, @Param("status") InvoiceStatus status, Pageable pageable);
}