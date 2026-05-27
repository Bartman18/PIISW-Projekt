package com.piisw.common.mapper;

import com.piisw.catalog.TicketDefinition;
import com.piisw.ticket.Ticket;
import com.piisw.ticket.dto.TicketDto;
import com.piisw.user.User;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public TicketDto toDto(Ticket entity) {
        return new TicketDto(
                entity.getId(),
                entity.getDefinition().getId(),
                entity.getName(),
                entity.getPrice(),
                entity.getType(),
                entity.getCategory(),
                entity.getStatus(),
                toEpochMilli(entity.getPurchaseTime()),
                entity.getDurationMinutes(),
                entity.getValidityDays(),
                toEpochMilli(entity.getValidationTime()),
                entity.getVehicleId(),
                toEpochMilli(entity.getValidUntil()));
    }

    public Ticket fromDefinition(TicketDefinition definition, User owner) {
        String id = "TKT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return new Ticket(id, owner, definition, "active", Instant.now());
    }

    private Long toEpochMilli(Instant instant) {
        return instant == null ? null : instant.toEpochMilli();
    }
}
