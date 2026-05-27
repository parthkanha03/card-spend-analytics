package com.visa.spendanalytics.service;

import com.visa.spendanalytics.dto.*;
import com.visa.spendanalytics.exception.CardNotFoundException;
import com.visa.spendanalytics.exception.DuplicateCardException;
import com.visa.spendanalytics.exception.InsufficientBalanceException;
import com.visa.spendanalytics.model.Card;
import com.visa.spendanalytics.model.Category;
import com.visa.spendanalytics.model.Transaction;
import com.visa.spendanalytics.repository.CardRepository;
import com.visa.spendanalytics.repository.TransactionRepository;
import com.visa.spendanalytics.util.CardMaskingUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {

    private static final Logger log = LoggerFactory.getLogger(CardService.class);

    private final CardRepository cardRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Enrolls a new card.
     * The full card number is hashed immediately — it never touches the DB or logs.
     */
    @Transactional
    public CardResponse enrollCard(CardEnrollRequest request) {
        String hash = CardMaskingUtil.hash(request.getCardNumber());
        String lastFour = CardMaskingUtil.extractLastFour(request.getCardNumber());

        if (cardRepository.existsByCardNumberHash(hash)) {
            log.warn("Duplicate card enrollment attempt for card ending in {}", lastFour);
            throw new DuplicateCardException();
        }

        Card card = new Card();
        card.setName(request.getName());
        card.setCardNumberHash(hash);
        card.setLastFourDigits(lastFour);
        card.setCreditLimit(request.getCreditLimit());

        Card saved = cardRepository.save(card);
        log.info("Card enrolled: id={}, name={}, ending={}", saved.getId(), saved.getName(), lastFour);

        // New card has no transactions; available balance equals the full credit limit.
        return toCardResponse(saved, BigDecimal.ZERO);
    }

    /**
     * Records a payment against a card.
     * Enforces minimum-payment ($1.00 via DTO validation) and available-balance rules.
     */
    @Transactional
    public TransactionResponse makePayment(Long cardId, PaymentRequest request) {
        Card card = findCardOrThrow(cardId);
        BigDecimal totalSpent = transactionRepository.sumAmountByCardId(cardId);
        BigDecimal availableBalance = card.getCreditLimit().subtract(totalSpent);

        if (request.getAmount().compareTo(availableBalance) > 0) {
            log.warn("Insufficient balance on card id={}: requested={}, available={}",
                cardId, request.getAmount(), availableBalance);
            throw new InsufficientBalanceException(request.getAmount(), availableBalance);
        }

        Transaction transaction = new Transaction();
        transaction.setCard(card);
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setMerchant(request.getMerchant());

        Transaction saved = transactionRepository.save(transaction);
        log.info("Payment recorded: card={}, amount={}, category={}, merchant={}",
            CardMaskingUtil.mask(card.getLastFourDigits()),
            saved.getAmount(), saved.getCategory(), saved.getMerchant());

        return toTransactionResponse(saved);
    }

    /** Returns full dashboard data for a card: balances, per-category spend, transaction history. */
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long cardId) {
        Card card = findCardOrThrow(cardId);

        BigDecimal totalSpent = transactionRepository.sumAmountByCardId(cardId);
        BigDecimal availableBalance = card.getCreditLimit().subtract(totalSpent);

        Map<Category, BigDecimal> spendByCategory = buildSpendByCategory(cardId);

        List<TransactionResponse> transactions = transactionRepository
            .findByCardIdOrderByCreatedAtDesc(cardId)
            .stream()
            .map(this::toTransactionResponse)
            .collect(Collectors.toList());

        return DashboardResponse.builder()
            .cardId(card.getId())
            .cardName(card.getName())
            .maskedCardNumber(CardMaskingUtil.mask(card.getLastFourDigits()))
            .creditLimit(card.getCreditLimit())
            .availableBalance(availableBalance)
            .totalSpent(totalSpent)
            .spendByCategory(spendByCategory)
            .recentTransactions(transactions)
            .build();
    }

    @Transactional(readOnly = true)
    public List<CardResponse> listCards() {
        return cardRepository.findAll().stream()
            .map(card -> toCardResponse(card, transactionRepository.sumAmountByCardId(card.getId())))
            .collect(Collectors.toList());
    }

    // ── Private helpers ────────────────────────────────────────────────────────

    private Card findCardOrThrow(Long cardId) {
        return cardRepository.findById(cardId)
            .orElseThrow(() -> new CardNotFoundException(cardId));
    }

    private Map<Category, BigDecimal> buildSpendByCategory(Long cardId) {
        // Seed every category with zero so the chart always renders all slices.
        Map<Category, BigDecimal> result = new EnumMap<>(Category.class);
        Arrays.stream(Category.values()).forEach(cat -> result.put(cat, BigDecimal.ZERO));

        // Single GROUP BY query — fills only categories that have transactions.
        transactionRepository.findSpendGroupedByCategory(cardId)
            .forEach(row -> result.put((Category) row[0], (BigDecimal) row[1]));

        return result;
    }

    private CardResponse toCardResponse(Card card, BigDecimal totalSpent) {
        return CardResponse.builder()
            .id(card.getId())
            .name(card.getName())
            .maskedCardNumber(CardMaskingUtil.mask(card.getLastFourDigits()))
            .creditLimit(card.getCreditLimit())
            .availableBalance(card.getCreditLimit().subtract(totalSpent))
            .enrolledAt(card.getEnrolledAt())
            .build();
    }

    private TransactionResponse toTransactionResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .amount(t.getAmount())
            .category(t.getCategory())
            .merchant(t.getMerchant())
            .createdAt(t.getCreatedAt())
            .build();
    }
}
