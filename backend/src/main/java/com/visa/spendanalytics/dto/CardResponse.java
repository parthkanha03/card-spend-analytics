package com.visa.spendanalytics.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CardResponse {
    private Long id;
    private String name;
    private String maskedCardNumber;
    private BigDecimal creditLimit;
    private BigDecimal availableBalance;
    private LocalDateTime enrolledAt;
}
