package com.arenape.webapi.repository;

import com.arenape.webapi.entity.Ticket;
import com.arenape.webapi.entity.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByBuyerEmail(String email);

    @Query("SELECT COALESCE(SUM(t.quantity), 0) FROM Ticket t WHERE t.status = :status")
    Integer sumQuantityByStatus(TicketStatus status);

    @Query("SELECT COALESCE(SUM(t.totalPrice), 0) FROM Ticket t WHERE t.status = :status")
    BigDecimal sumTotalPriceByStatus(TicketStatus status);
}