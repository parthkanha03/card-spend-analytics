package com.visa.spendanalytics.exception;

import java.math.BigDecimal;

public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(BigDecimal requested, BigDecimal available) {
        super(String.format(
            "Insufficient balance. Requested: $%.2f, Available: $%.2f",
            requested, available
        ));
    }
}
