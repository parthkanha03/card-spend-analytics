package com.visa.spendanalytics.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

/**
 * Utility for card number masking and hashing.
 * Full card numbers must NEVER appear in responses, logs, or persistence.
 */
public final class CardMaskingUtil {

    private CardMaskingUtil() {}

    /**
     * Returns the masked display form: "**** **** **** XXXX"
     */
    public static String mask(String lastFourDigits) {
        return "**** **** **** " + lastFourDigits;
    }

    /**
     * Extracts the last 4 digits from a raw card number (strips spaces/dashes).
     */
    public static String extractLastFour(String rawCardNumber) {
        String normalized = normalize(rawCardNumber);
        return normalized.substring(normalized.length() - 4);
    }

    /**
     * SHA-256 hash of the normalized card number for safe duplicate detection.
     */
    public static String hash(String rawCardNumber) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(normalize(rawCardNumber).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }

    private static String normalize(String cardNumber) {
        return cardNumber.replaceAll("[\\s\\-]", "");
    }
}
