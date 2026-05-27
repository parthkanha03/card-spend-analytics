package com.visa.spendanalytics.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /**
     * SHA-256 hash of the normalized card number — used for duplicate detection.
     * The full card number is NEVER persisted.
     */
    @Column(nullable = false, unique = true)
    private String cardNumberHash;

    /** Last 4 digits only — safe to store and display. */
    @Column(nullable = false, length = 4)
    private String lastFourDigits;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal creditLimit;

    @Column(nullable = false)
    private LocalDateTime enrolledAt;

    @PrePersist
    void onEnroll() {
        this.enrolledAt = LocalDateTime.now();
    }
}
