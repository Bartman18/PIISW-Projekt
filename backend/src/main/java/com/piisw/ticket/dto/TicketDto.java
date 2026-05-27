package com.piisw.ticket.dto;

import java.math.BigDecimal;

public record TicketDto(
        String id,
        String definitionId,
        String name,
        BigDecimal price,
        String type,
        String category,
        String status,
        Long purchaseTime,
        Integer durationMinutes,
        Integer validityDays,
        Long validationTime,
        String vehicleId,
        Long validUntil) {
}
