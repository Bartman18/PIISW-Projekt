package com.piisw.common.mapper;

import com.piisw.catalog.TicketDefinition;
import com.piisw.catalog.dto.TicketDefinitionDto;
import org.springframework.stereotype.Component;

@Component
public class TicketDefinitionMapper {

    public TicketDefinitionDto toDto(TicketDefinition entity) {
        return new TicketDefinitionDto(
                entity.getId(),
                entity.getName(),
                entity.getPrice(),
                entity.getType(),
                entity.getCategory(),
                entity.getDurationMinutes(),
                entity.getValidityDays());
    }
}
