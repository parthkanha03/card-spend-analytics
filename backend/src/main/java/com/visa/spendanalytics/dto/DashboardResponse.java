package com.visa.spendanalytics.dto;

import com.visa.spendanalytics.model.Category;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class DashboardResponse {
    private Long cardId;
    private String cardName;
    private String maskedCardNumber;
    private BigDecimal creditLimit;
    private BigDecimal availableBalance;
    private BigDecimal totalSpent;
    private Map<Category, BigDecimal> spendByCategory;
    private List<TransactionResponse> recentTransactions;
}
