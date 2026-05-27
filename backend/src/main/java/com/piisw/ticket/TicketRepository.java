package com.piisw.ticket;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, String> {

    List<Ticket> findByOwnerIdOrderByPurchaseTimeDesc(Long ownerId);

    Optional<Ticket> findByIdAndOwnerId(String id, Long ownerId);
}
