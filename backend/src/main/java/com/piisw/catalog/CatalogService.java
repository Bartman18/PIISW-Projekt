package com.piisw.catalog;

import com.piisw.catalog.dto.TicketDefinitionDto;
import com.piisw.common.mapper.TicketDefinitionMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogService {

    private final TicketDefinitionRepository repository;
    private final TicketDefinitionMapper mapper;

    public CatalogService(TicketDefinitionRepository repository, TicketDefinitionMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<TicketDefinitionDto> getCatalog() {
        return repository.findAll().stream().map(mapper::toDto).toList();
    }
}
