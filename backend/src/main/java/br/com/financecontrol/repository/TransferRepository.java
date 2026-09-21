package br.com.financecontrol.repository;

import br.com.financecontrol.entity.Transfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TransferRepository extends JpaRepository<Transfer, UUID> {

    @EntityGraph(attributePaths = {"sourceAccount", "destinationAccount"})
    Page<Transfer> findByUser_Id(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"sourceAccount", "destinationAccount"})
    Optional<Transfer> findByUser_IdAndId(UUID userId, UUID id);
}