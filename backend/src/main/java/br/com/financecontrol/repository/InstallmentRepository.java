package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Installment;
import br.com.financecontrol.entity.enums.InstallmentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface InstallmentRepository extends JpaRepository<Installment, UUID> {

    @EntityGraph(attributePaths = {"purchase", "purchase.creditCard", "purchase.category", "invoice"})
    List<Installment> findByInvoice_Id(UUID invoiceId);

    @EntityGraph(attributePaths = {"invoice"})
    List<Installment> findByPurchase_Id(UUID purchaseId);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Installment i JOIN i.purchase p JOIN p.creditCard cc " +
            "WHERE cc.id = :cardId AND i.status = :status")
    BigDecimal sumByCardAndStatus(@Param("cardId") UUID cardId, @Param("status") InstallmentStatus status);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Installment i JOIN i.invoice inv JOIN inv.creditCard cc " +
            "WHERE cc.user.id = :userId AND inv.referenceMonth BETWEEN :start AND :end")
    BigDecimal sumCardExpensesByPeriod(@Param("userId") UUID userId,
                                       @Param("start") LocalDate start,
                                       @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(i.amount), 0) FROM Installment i " +
            "JOIN i.purchase p JOIN i.invoice inv JOIN p.creditCard cc " +
            "WHERE cc.user.id = :userId AND p.category.id = :categoryId " +
            "AND inv.referenceMonth BETWEEN :start AND :end")
    BigDecimal sumByCategoryAndPeriod(@Param("userId") UUID userId,
                                      @Param("categoryId") UUID categoryId,
                                      @Param("start") LocalDate start,
                                      @Param("end") LocalDate end);

    @Query("SELECT p.category.id as categoryId, SUM(i.amount) as total FROM Installment i " +
            "JOIN i.purchase p JOIN i.invoice inv JOIN p.creditCard cc " +
            "WHERE cc.user.id = :userId AND inv.referenceMonth BETWEEN :start AND :end " +
            "GROUP BY p.category.id")
    List<Object[]> sumExpenseByCategoryAndPeriod(@Param("userId") UUID userId,
                                                 @Param("start") LocalDate start,
                                                 @Param("end") LocalDate end);
}