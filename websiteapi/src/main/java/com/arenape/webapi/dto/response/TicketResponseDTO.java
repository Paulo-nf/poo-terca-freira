package com.arenape.webapi.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketResponseDTO(
    Long id,
    Long eventId,
    String eventName,
    String eventLocation,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    LocalDateTime eventDate,

    String buyerName,
    String buyerEmail,
    Integer quantity,
    BigDecimal totalPrice,

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    LocalDateTime purchaseDate,

    String status
) {}