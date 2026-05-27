package com.visa.spendanalytics.dto;

import com.visa.spendanalytics.model.Category;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private Category category;
    private String merchant;
    private LocalDateTime createdAt;
}
