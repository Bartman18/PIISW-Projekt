package com.piisw.ticket.dto;

public record VerificationResult(
        boolean valid,
        String message,
        TicketDto ticket) {
}
