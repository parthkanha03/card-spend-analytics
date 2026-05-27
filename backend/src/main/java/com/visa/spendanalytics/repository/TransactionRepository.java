package com.visa.spendanalytics.repository;

import com.visa.spendanalytics.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByCardIdOrderByCreatedAtDesc(Long cardId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.card.id = :cardId")
    BigDecimal sumAmountByCardId(@Param("cardId") Long cardId);

    /** Single GROUP BY — replaces 5 per-category queries on the dashboard call. */
    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.card.id = :cardId GROUP BY t.category")
    List<Object[]> findSpendGroupedByCategory(@Param("cardId") Long cardId);
}
