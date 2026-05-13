package com.taasselunga.pos.controller;

import com.taasselunga.pos.domain.ReplenishmentRequest;
import com.taasselunga.pos.service.PointOfSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class PointOfSaleController {

    private final PointOfSaleService posService;

    // RESPONSABILE_PUNTO_VENDITA e OPERATORE_DI_MAGAZZINO possono creare richieste di rifornimento
    @PreAuthorize("hasAnyRole('RESPONSABILE_PUNTO_VENDITA', 'OPERATORE_DI_MAGAZZINO')")
    @PostMapping("/replenishment")
    public ResponseEntity<ReplenishmentRequest> requestReplenishment(
            @RequestParam Long storeId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        ReplenishmentRequest request = posService.createReplenishmentRequest(storeId, productId, quantity);
        return ResponseEntity.ok(request);
    }

    // RESPONSABILE_APPROVVIGIONAMENTO, RESPONSABILE_PUNTO_VENDITA e OPERATORE_DI_MAGAZZINO possono visualizzare le richieste del punto vendita
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'RESPONSABILE_PUNTO_VENDITA', 'OPERATORE_DI_MAGAZZINO')")
    @GetMapping("/store/{storeId}/requests")
    public ResponseEntity<List<ReplenishmentRequest>> getRequestsByStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(posService.getStoreRequests(storeId));
    }
}