package com.piisw.ticket;

import com.piisw.auth.AuthenticatedUser;
import com.piisw.ticket.dto.PurchaseRequest;
import com.piisw.ticket.dto.TicketDto;
import com.piisw.ticket.dto.ValidateRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/passenger/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<TicketDto> list(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ticketService.listForUser(principal.id());
    }

    @PostMapping("/purchase")
    public TicketDto purchase(@AuthenticationPrincipal AuthenticatedUser principal,
                              @Valid @RequestBody PurchaseRequest request) {
        return ticketService.purchase(principal.id(), request.definitionId());
    }

    @PostMapping("/{id}/validate")
    public TicketDto validate(@AuthenticationPrincipal AuthenticatedUser principal,
                              @PathVariable String id,
                              @RequestBody(required = false) ValidateRequest request) {
        String vehicleId = request == null ? null : request.vehicleId();
        return ticketService.validate(principal.id(), id, vehicleId);
    }
}
