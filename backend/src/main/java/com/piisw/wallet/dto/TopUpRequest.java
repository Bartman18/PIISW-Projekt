package com.piisw.wallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record TopUpRequest(
        @NotNull
        @DecimalMin(value = "0.01", message = "Kwota musi być dodatnia")
        BigDecimal amount) {
}
