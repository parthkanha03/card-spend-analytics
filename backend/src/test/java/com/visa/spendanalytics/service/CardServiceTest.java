package com.visa.spendanalytics.service;

import com.visa.spendanalytics.dto.CardEnrollRequest;
import com.visa.spendanalytics.dto.CardResponse;
import com.visa.spendanalytics.dto.DashboardResponse;
import com.visa.spendanalytics.dto.PaymentRequest;
import com.visa.spendanalytics.dto.TransactionResponse;
import com.visa.spendanalytics.exception.CardNotFoundException;
import com.visa.spendanalytics.exception.DuplicateCardException;
import com.visa.spendanalytics.exception.InsufficientBalanceException;
import com.visa.spendanalytics.model.Card;
import com.visa.spendanalytics.model.Category;
import com.visa.spendanalytics.model.Transaction;
import com.visa.spendanalytics.repository.CardRepository;
import com.visa.spendanalytics.repository.TransactionRepository;
import com.visa.spendanalytics.util.CardMaskingUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private CardService cardService;

    private Card mockCard;

    @BeforeEach
    void setUp() {
        mockCard = new Card();
        mockCard.setId(1L);
        mockCard.setName("My Visa");
        mockCard.setLastFourDigits("4242");
        mockCard.setCardNumberHash(CardMaskingUtil.hash("4111111111114242"));
        mockCard.setCreditLimit(new BigDecimal("5000.00"));
        mockCard.setEnrolledAt(LocalDateTime.now());
    }

    // ── Enroll card ────────────────────────────────────────────────────────────

    @Test
    void enrollCard_success() {
        CardEnrollRequest request = new CardEnrollRequest();
        request.setName("My Visa");
        request.setCardNumber("4111 1111 1111 4242");
        request.setCreditLimit(new BigDecimal("5000.00"));

        when(cardRepository.existsByCardNumberHash(anyString())).thenReturn(false);
        when(cardRepository.save(any(Card.class))).thenReturn(mockCard);

        CardResponse response = cardService.enrollCard(request);

        assertThat(response.getName()).isEqualTo("My Visa");
        assertThat(response.getMaskedCardNumber()).isEqualTo("**** **** **** 4242");
        assertThat(response.getCreditLimit()).isEqualByComparingTo("5000.00");
        assertThat(response.getAvailableBalance()).isEqualByComparingTo("5000.00");
        verify(transactionRepository, never()).sumAmountByCardId(any());
    }

    @Test
    void enrollCard_duplicateCard_throwsDuplicateCardException() {
        CardEnrollRequest request = new CardEnrollRequest();
        request.setName("My Visa");
        request.setCardNumber("4111 1111 1111 4242");
        request.setCreditLimit(new BigDecimal("5000.00"));

        when(cardRepository.existsByCardNumberHash(anyString())).thenReturn(true);

        assertThatThrownBy(() -> cardService.enrollCard(request))
            .isInstanceOf(DuplicateCardException.class);
        verify(cardRepository, never()).save(any());
    }

    // ── Make payment ───────────────────────────────────────────────────────────

    @Test
    void makePayment_success() {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("100.00"));
        request.setCategory(Category.DINING);
        request.setMerchant("Chipotle");

        when(cardRepository.findById(1L)).thenReturn(Optional.of(mockCard));
        when(transactionRepository.sumAmountByCardId(1L)).thenReturn(new BigDecimal("200.00"));

        Transaction tx = new Transaction();
        tx.setId(1L);
        tx.setAmount(request.getAmount());
        tx.setCategory(request.getCategory());
        tx.setMerchant(request.getMerchant());
        tx.setCard(mockCard);
        tx.setCreatedAt(LocalDateTime.now());

        when(transactionRepository.save(any())).thenReturn(tx);

        TransactionResponse response = cardService.makePayment(1L, request);

        assertThat(response.getAmount()).isEqualByComparingTo("100.00");
        assertThat(response.getCategory()).isEqualTo(Category.DINING);
        assertThat(response.getMerchant()).isEqualTo("Chipotle");
    }

    @Test
    void makePayment_insufficientBalance_throwsInsufficientBalanceException() {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("5000.00"));
        request.setCategory(Category.TRAVEL);
        request.setMerchant("Delta");

        when(cardRepository.findById(1L)).thenReturn(Optional.of(mockCard));
        when(transactionRepository.sumAmountByCardId(1L)).thenReturn(new BigDecimal("4500.00"));

        assertThatThrownBy(() -> cardService.makePayment(1L, request))
            .isInstanceOf(InsufficientBalanceException.class)
            .hasMessageContaining("Insufficient balance");
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void makePayment_exactAvailableBalance_succeeds() {
        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("5000.00"));
        request.setCategory(Category.SHOPPING);
        request.setMerchant("Amazon");

        when(cardRepository.findById(1L)).thenReturn(Optional.of(mockCard));
        when(transactionRepository.sumAmountByCardId(1L)).thenReturn(BigDecimal.ZERO);

        Transaction tx = new Transaction();
        tx.setId(1L);
        tx.setAmount(request.getAmount());
        tx.setCategory(request.getCategory());
        tx.setMerchant(request.getMerchant());
        tx.setCard(mockCard);
        tx.setCreatedAt(LocalDateTime.now());

        when(transactionRepository.save(any())).thenReturn(tx);

        assertThatCode(() -> cardService.makePayment(1L, request)).doesNotThrowAnyException();
    }

    @Test
    void makePayment_cardNotFound_throwsCardNotFoundException() {
        when(cardRepository.findById(99L)).thenReturn(Optional.empty());

        PaymentRequest request = new PaymentRequest();
        request.setAmount(new BigDecimal("50.00"));
        request.setCategory(Category.GROCERIES);
        request.setMerchant("Trader Joe's");

        assertThatThrownBy(() -> cardService.makePayment(99L, request))
            .isInstanceOf(CardNotFoundException.class);
    }

    // ── Dashboard ──────────────────────────────────────────────────────────────

    @Test
    void getDashboard_returnsCorrectBalancesAndSpend() {
        when(cardRepository.findById(1L)).thenReturn(Optional.of(mockCard));
        when(transactionRepository.sumAmountByCardId(1L)).thenReturn(new BigDecimal("300.00"));
        when(transactionRepository.findSpendGroupedByCategory(1L)).thenReturn(Collections.emptyList());
        when(transactionRepository.findByCardIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());

        DashboardResponse response = cardService.getDashboard(1L);

        assertThat(response.getCreditLimit()).isEqualByComparingTo("5000.00");
        assertThat(response.getTotalSpent()).isEqualByComparingTo("300.00");
        assertThat(response.getAvailableBalance()).isEqualByComparingTo("4700.00");
        assertThat(response.getMaskedCardNumber()).isEqualTo("**** **** **** 4242");
        // All 5 categories should be present (seeded to zero)
        assertThat(response.getSpendByCategory()).hasSize(5);
    }

    // ── Card masking util ──────────────────────────────────────────────────────

    @Test
    void cardMaskingUtil_maskReturnsCorrectFormat() {
        assertThat(CardMaskingUtil.mask("4242")).isEqualTo("**** **** **** 4242");
    }

    @Test
    void cardMaskingUtil_extractLastFour() {
        assertThat(CardMaskingUtil.extractLastFour("4111 1111 1111 4242")).isEqualTo("4242");
        assertThat(CardMaskingUtil.extractLastFour("4111111111114242")).isEqualTo("4242");
    }

    @Test
    void cardMaskingUtil_hashIsDeterministic() {
        String h1 = CardMaskingUtil.hash("4111 1111 1111 4242");
        String h2 = CardMaskingUtil.hash("4111111111114242");
        assertThat(h1).isEqualTo(h2);
    }

    @Test
    void cardMaskingUtil_differentCardsDifferentHashes() {
        String h1 = CardMaskingUtil.hash("4111111111114242");
        String h2 = CardMaskingUtil.hash("5500005555555559");
        assertThat(h1).isNotEqualTo(h2);
    }
}
