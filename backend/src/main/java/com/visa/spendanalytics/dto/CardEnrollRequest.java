package com.visa.spendanalytics.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CardEnrollRequest {

    @NotBlank(message = "Card name is required")
    private String name;

    /**
     * Full card number — accepted at the API boundary only.
     * Must be 13–19 digits (spaces/dashes allowed).
     */
    @NotBlank(message = "Card number is required")
    @Pattern(regexp = "[0-9 \\-]{13,23}", message = "Invalid card number format")
    private String cardNumber;

    @NotNull(message = "Credit limit is required")
    @DecimalMin(value = "1.00", message = "Credit limit must be at least $1.00")
    private BigDecimal creditLimit;
}
