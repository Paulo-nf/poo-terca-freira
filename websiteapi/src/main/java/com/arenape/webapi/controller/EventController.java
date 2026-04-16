package com.arenape.webapi.controller;
 
import com.arenape.webapi.dto.request.EventRequestDTO;
import com.arenape.webapi.dto.response.EventResponseDTO;
import com.arenape.webapi.service.EventService;
 
import jakarta.validation.Valid;
 
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
 
import java.util.List;
 
@RestController
@RequestMapping("/events")
public class EventController {
 
    private final EventService service;
 
    public EventController(EventService service) {
        this.service = service;
    }
 
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @SecurityRequirement(name = "bearerAuth")
    public EventResponseDTO createEvent(@RequestBody @Valid EventRequestDTO request) {
        return service.create(request);
    }
 
    @GetMapping
    public List<EventResponseDTO> findAll() {
        return service.findAll();
    }
 
    @GetMapping("/{id}")
    public EventResponseDTO findById(@PathVariable Long id) {
        return service.findById(id);
    }
 
    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public EventResponseDTO update(
            @PathVariable Long id,
            @RequestBody @Valid EventRequestDTO request) {
        return service.update(id, request);
    }
 
    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}