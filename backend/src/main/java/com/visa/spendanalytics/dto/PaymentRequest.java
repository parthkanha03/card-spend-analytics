package com.visa.spendanalytics.dto;

import com.visa.spendanalytics.model.Category;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PaymentRequest {

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.00", message = "Minimum payment is $1.00")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private Category category;

    @NotBlank(message = "Merchant is required")
    private String merchant;
}
