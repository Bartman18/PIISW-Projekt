package com.piisw.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record PurchaseRequest(
        @NotBlank String definitionId) {
}
