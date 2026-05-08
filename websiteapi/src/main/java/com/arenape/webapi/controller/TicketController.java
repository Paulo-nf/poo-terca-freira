package com.arenape.webapi.controller;

import com.arenape.webapi.dto.request.TicketRequestDTO;
import com.arenape.webapi.dto.response.TicketResponseDTO;
import com.arenape.webapi.dto.response.TicketSummaryDTO;
import com.arenape.webapi.service.TicketService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@SecurityRequirement(name = "bearerAuth")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping("/purchase")
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponseDTO purchase(
            @RequestBody @Valid TicketRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ticketService.purchase(request, userDetails.getUsername());
    }

    @GetMapping("/my")
    public List<TicketResponseDTO> myTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ticketService.findMyTickets(userDetails.getUsername());
    }

    @GetMapping("/summary")
    public TicketSummaryDTO summary() {
        return ticketService.getSummary();
    }
}