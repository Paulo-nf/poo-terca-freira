package com.arenape.webapi.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TicketRequestDTO(

    @NotNull(message = "O id do evento é obrigatório")
    Long eventId,

    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 1, message = "A quantidade mínima é 1")
    Integer quantity

) {}