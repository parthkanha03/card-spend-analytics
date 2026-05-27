package com.visa.spendanalytics.exception;

public class DuplicateCardException extends RuntimeException {
    public DuplicateCardException() {
        super("A card with this number is already enrolled");
    }
}
