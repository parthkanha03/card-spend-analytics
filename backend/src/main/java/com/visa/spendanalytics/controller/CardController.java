package com.visa.spendanalytics.controller;

import com.visa.spendanalytics.dto.*;
import com.visa.spendanalytics.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    /** POST /api/cards — Enroll a new card */
    @PostMapping("/cards")
    public ResponseEntity<CardResponse> enrollCard(@Valid @RequestBody CardEnrollRequest request) {
        CardResponse response = cardService.enrollCard(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** GET /api/cards — List all enrolled cards */
    @GetMapping("/cards")
    public ResponseEntity<List<CardResponse>> listCards() {
        return ResponseEntity.ok(cardService.listCards());
    }

    /** POST /api/cards/{id}/pay — Make a payment on a card */
    @PostMapping("/cards/{id}/pay")
    public ResponseEntity<TransactionResponse> makePayment(
        @PathVariable Long id,
        @Valid @RequestBody PaymentRequest request
    ) {
        TransactionResponse response = cardService.makePayment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** GET /api/dashboard/{cardId} — Per-card spend breakdown and history */
    @GetMapping("/dashboard/{cardId}")
    public ResponseEntity<DashboardResponse> getDashboard(@PathVariable Long cardId) {
        return ResponseEntity.ok(cardService.getDashboard(cardId));
    }
}
