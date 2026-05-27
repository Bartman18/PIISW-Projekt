package com.piisw.ticket;

import com.piisw.catalog.TicketDefinition;
import com.piisw.catalog.TicketDefinitionRepository;
import com.piisw.common.exception.ApiException;
import com.piisw.common.exception.ResourceNotFoundException;
import com.piisw.common.exception.TicketAlreadyValidatedException;
import com.piisw.common.mapper.TicketMapper;
import com.piisw.ticket.dto.TicketDto;
import com.piisw.ticket.dto.VerificationResult;
import com.piisw.user.User;
import com.piisw.user.UserRepository;
import com.piisw.wallet.WalletService;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TicketService {

    private static final DateTimeFormatter VALID_UNTIL_FORMAT =
            DateTimeFormatter.ofPattern("d.MM.yyyy, HH:mm:ss");

    private final TicketRepository ticketRepository;
    private final TicketDefinitionRepository definitionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final TicketMapper ticketMapper;

    public TicketService(TicketRepository ticketRepository,
                         TicketDefinitionRepository definitionRepository,
                         UserRepository userRepository,
                         WalletService walletService,
                         TicketMapper ticketMapper) {
        this.ticketRepository = ticketRepository;
        this.definitionRepository = definitionRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
        this.ticketMapper = ticketMapper;
    }

    @Transactional(readOnly = true)
    public List<TicketDto> listForUser(Long userId) {
        return ticketRepository.findByOwnerIdOrderByPurchaseTimeDesc(userId).stream()
                .map(ticketMapper::toDto)
                .toList();
    }

    @Transactional
    public TicketDto purchase(Long userId, String definitionId) {
        TicketDefinition definition = definitionRepository.findById(definitionId)
                .orElseThrow(() -> new ResourceNotFoundException("Nieznany typ biletu"));
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Użytkownik nie istnieje"));

        walletService.debit(userId, definition.getPrice());

        Ticket ticket = ticketMapper.fromDefinition(definition, owner);
        ticketRepository.save(ticket);
        return ticketMapper.toDto(ticket);
    }

    @Transactional
    public TicketDto validate(Long userId, String ticketId, String vehicleId) {
        Ticket ticket = ticketRepository.findByIdAndOwnerId(ticketId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Biletu nie znaleziono"));

        if ("validated".equals(ticket.getStatus())) {
            throw new TicketAlreadyValidatedException("Bilet został już skasowany");
        }
        boolean single = "jednorazowy".equals(ticket.getType());
        if (single && (vehicleId == null || vehicleId.isBlank())) {
            throw new ApiException("Bilet jednorazowy wymaga podania pojazdu", HttpStatus.BAD_REQUEST);
        }

        Instant now = Instant.now();
        Instant validUntil = ticket.getValidUntil();
        if ("czasowy".equals(ticket.getType()) && ticket.getDurationMinutes() != null) {
            validUntil = now.plus(Duration.ofMinutes(ticket.getDurationMinutes()));
        } else if ("okresowy".equals(ticket.getType()) && ticket.getValidityDays() != null) {
            validUntil = now.plus(Duration.ofDays(ticket.getValidityDays()));
        }

        ticket.setStatus("validated");
        ticket.setValidationTime(now);
        if (single) {
            ticket.setVehicleId(vehicleId);
        }
        ticket.setValidUntil(validUntil);
        return ticketMapper.toDto(ticket);
    }

    @Transactional(readOnly = true)
    public VerificationResult verify(String ticketId, String vehicleId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> evaluate(ticket, vehicleId))
                .orElseGet(() -> new VerificationResult(false,
                        "Bilet " + ticketId + " nie istnieje w systemie.", null));
    }

    private VerificationResult evaluate(Ticket ticket, String vehicleId) {
        Instant now = Instant.now();
        TicketDto dto = ticketMapper.toDto(ticket);
        boolean validated = "validated".equals(ticket.getStatus());

        return switch (ticket.getType()) {
            case "okresowy" -> {
                if (!validated || ticket.getValidUntil() == null) {
                    yield new VerificationResult(false, "Bilet okresowy nie został aktywowany.", dto);
                }
                if (!now.isAfter(ticket.getValidUntil())) {
                    yield new VerificationResult(true,
                            "Bilet okresowy ważny do " + format(ticket.getValidUntil()) + ".", dto);
                }
                yield new VerificationResult(false, "Bilet okresowy stracił ważność.", dto);
            }
            case "jednorazowy" -> {
                if (!validated) {
                    yield new VerificationResult(false, "Bilet jednorazowy nie został skasowany.", dto);
                }
                if (!java.util.Objects.equals(ticket.getVehicleId(), vehicleId)) {
                    String where = ticket.getVehicleId() == null ? "brak" : ticket.getVehicleId();
                    yield new VerificationResult(false,
                            "Bilet skasowany w innym pojeździe (" + where + ").", dto);
                }
                yield new VerificationResult(true, "Bilet jednorazowy ważny w tym pojeździe.", dto);
            }
            case "czasowy" -> {
                if (!validated || ticket.getValidUntil() == null) {
                    yield new VerificationResult(false, "Bilet czasowy nie został skasowany.", dto);
                }
                if (!now.isAfter(ticket.getValidUntil())) {
                    long remainingMin = (long) Math.ceil(
                            Duration.between(now, ticket.getValidUntil()).toMillis() / 60000.0);
                    yield new VerificationResult(true,
                            "Bilet czasowy ważny do " + format(ticket.getValidUntil())
                                    + " (jeszcze " + remainingMin + " min).", dto);
                }
                yield new VerificationResult(false,
                        "Bilet czasowy stracił ważność (" + format(ticket.getValidUntil()) + ").", dto);
            }
            default -> new VerificationResult(false, "Nieznany typ biletu.", dto);
        };
    }

    private String format(Instant instant) {
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault()).format(VALID_UNTIL_FORMAT);
    }
}
