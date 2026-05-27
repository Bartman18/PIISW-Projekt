package com.piisw.config;

import com.piisw.catalog.TicketDefinition;
import com.piisw.catalog.TicketDefinitionRepository;
import com.piisw.user.Role;
import com.piisw.user.User;
import com.piisw.user.UserRepository;
import com.piisw.wallet.Wallet;
import com.piisw.wallet.WalletRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private record BaseTicket(String baseId, String name, BigDecimal basePrice, String type,
                              Integer durationMinutes, Integer validityDays) {
    }

    private static final List<BaseTicket> BASE_TICKETS = List.of(
            new BaseTicket("test-1m", "Bilet testowy 1-minutowy", new BigDecimal("0.5"), "czasowy", 1, null),
            new BaseTicket("single", "Bilet jednorazowy", new BigDecimal("4.0"), "jednorazowy", null, null),
            new BaseTicket("time-15m", "Bilet czasowy 15-minutowy", new BigDecimal("3.0"), "czasowy", 15, null),
            new BaseTicket("time-30m", "Bilet czasowy 30-minutowy", new BigDecimal("4.5"), "czasowy", 30, null),
            new BaseTicket("time-60m", "Bilet czasowy 60-minutowy", new BigDecimal("6.0"), "czasowy", 60, null),
            new BaseTicket("time-24h", "Bilet czasowy 24h", new BigDecimal("15.0"), "czasowy", 24 * 60, null),
            new BaseTicket("time-72h", "Bilet czasowy 72h", new BigDecimal("30.0"), "czasowy", 72 * 60, null),
            new BaseTicket("period-30", "Bilet okresowy 30-dniowy", new BigDecimal("110.0"), "okresowy", null, 30),
            new BaseTicket("period-90", "Bilet okresowy 90-dniowy", new BigDecimal("280.0"), "okresowy", null, 90));

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TicketDefinitionRepository definitionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, WalletRepository walletRepository,
                           TicketDefinitionRepository definitionRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.definitionRepository = definitionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedCatalog();
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("pasazer")) {
            User passenger = userRepository.save(new User(
                    "pasazer", passwordEncoder.encode("pasazer"), "Anna Kowalska", Role.PASSENGER));
            walletRepository.save(new Wallet(passenger, new BigDecimal("50.00")));
        }
        if (!userRepository.existsByUsername("bileter")) {
            userRepository.save(new User(
                    "bileter", passwordEncoder.encode("bileter"), "Jan Nowak", Role.INSPECTOR));
        }
    }

    private void seedCatalog() {
        if (definitionRepository.count() > 0) {
            return;
        }
        for (BaseTicket base : BASE_TICKETS) {
            definitionRepository.save(buildDefinition(base, "normalny"));
            definitionRepository.save(buildDefinition(base, "ulgowy"));
        }
    }

    private TicketDefinition buildDefinition(BaseTicket base, String category) {
        String suffix = "normalny".equals(category) ? "n" : "u";
        BigDecimal price = "ulgowy".equals(category)
                ? base.basePrice().divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP)
                : base.basePrice();
        return new TicketDefinition(
                "def-" + base.baseId() + "-" + suffix,
                base.name(),
                price,
                base.type(),
                category,
                base.durationMinutes(),
                base.validityDays());
    }
}
