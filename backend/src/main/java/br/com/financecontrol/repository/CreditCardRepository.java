package br.com.financecontrol.repository;

import br.com.financecontrol.entity.CreditCard;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CreditCardRepository extends JpaRepository<CreditCard, UUID> {

    @EntityGraph(attributePaths = "user")
    List<CreditCard> findByUser_IdOrderByName(UUID userId);

    @EntityGraph(attributePaths = "user")
    Optional<CreditCard> findByUser_IdAndId(UUID userId, UUID id);
}