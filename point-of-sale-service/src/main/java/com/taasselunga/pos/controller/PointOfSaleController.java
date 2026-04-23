package com.taasselunga.pos.controller;

import com.taasselunga.pos.domain.ReplenishmentRequest;
import com.taasselunga.pos.service.PointOfSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class PointOfSaleController {

    private final PointOfSaleService posService;

    @PostMapping("/replenishment")
    public ResponseEntity<ReplenishmentRequest> requestReplenishment(
            @RequestParam Long storeId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {

        ReplenishmentRequest request = posService.createReplenishmentRequest(storeId, productId, quantity);
        return ResponseEntity.ok(request);
    }

    @GetMapping("/store/{storeId}/requests")
    public ResponseEntity<List<ReplenishmentRequest>> getRequestsByStore(@PathVariable Long storeId) {
        return ResponseEntity.ok(posService.getStoreRequests(storeId));
    }
}