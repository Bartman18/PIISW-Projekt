package com.piisw.catalog.dto;

import java.math.BigDecimal;

public record TicketDefinitionDto(
        String id,
        String name,
        BigDecimal price,
        String type,
        String category,
        Integer durationMinutes,
        Integer validityDays) {
}
