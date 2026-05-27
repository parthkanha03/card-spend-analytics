package com.visa.spendanalytics.repository;

import com.visa.spendanalytics.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {

    boolean existsByCardNumberHash(String cardNumberHash);

    Optional<Card> findByCardNumberHash(String cardNumberHash);
}
