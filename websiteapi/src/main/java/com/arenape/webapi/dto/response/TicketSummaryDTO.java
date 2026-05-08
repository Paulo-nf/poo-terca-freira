package com.arenape.webapi.dto.response;

import java.math.BigDecimal;

public record TicketSummaryDTO(
    Integer totalTicketsSold,
    BigDecimal totalRevenue
) {}