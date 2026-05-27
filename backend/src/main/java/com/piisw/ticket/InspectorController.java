package com.piisw.ticket;

import com.piisw.ticket.dto.VerificationResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inspector")
public class InspectorController {

    private final TicketService ticketService;

    public InspectorController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/verify")
    public VerificationResult verify(@RequestParam String ticketId,
                                     @RequestParam String vehicleId) {
        return ticketService.verify(ticketId, vehicleId);
    }
}
