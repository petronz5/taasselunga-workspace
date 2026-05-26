package com.taasselunga.pos.controller;

import com.taasselunga.pos.domain.ReplenishmentRequest;
import com.taasselunga.pos.domain.StoreStock;
import com.taasselunga.pos.service.PointOfSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos")
@RequiredArgsConstructor
public class PointOfSaleController {

    private final PointOfSaleService posService;

    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @GetMapping("/products")
    public ResponseEntity<Object> getProducts(Authentication authentication) {
        String token = getToken(authentication);

        return ResponseEntity.ok(posService.getProductsFromInventory(token));
    }

    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @PostMapping("/replenishment")
    public ResponseEntity<ReplenishmentRequest> requestReplenishment(
            @RequestParam Long storeId,
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            Authentication authentication
    ) {
        if (!hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        String token = getToken(authentication);

        ReplenishmentRequest request = posService.createReplenishmentRequest(
                storeId,
                productId,
                quantity,
                token
        );

        return ResponseEntity.ok(request);
    }

    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'RESPONSABILE_PUNTO_VENDITA', 'OPERATORE_DI_MAGAZZINO')")
    @GetMapping("/store/{storeId}/requests")
    public ResponseEntity<List<ReplenishmentRequest>> getRequestsByStore(
            @PathVariable Long storeId,
            Authentication authentication
    ) {
        if (isStoreManager(authentication) && !hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(posService.getStoreRequests(storeId));
    }

    @PreAuthorize("hasRole('OPERATORE_DI_MAGAZZINO')")
    @GetMapping("/requests")
    public ResponseEntity<List<ReplenishmentRequest>> getAllRequests() {
        return ResponseEntity.ok(posService.getAllRequests());
    }

    @PreAuthorize("hasRole('OPERATORE_DI_MAGAZZINO')")
    @PatchMapping("/requests/{id}/status")
    public ResponseEntity<ReplenishmentRequest> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication
    ) {
        String token = getToken(authentication);

        return ResponseEntity.ok(
                posService.updateRequestStatus(id, status, token)
        );
    }

    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @GetMapping("/store-stock/{storeId}")
    public ResponseEntity<List<StoreStock>> getStoreStock(
            @PathVariable Long storeId,
            Authentication authentication
    ) {
        if (!hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(posService.getStoreStock(storeId));
    }

    private String getToken(Authentication authentication) {
        return ((JwtAuthenticationToken) authentication).getToken().getTokenValue();
    }

    private boolean isStoreManager(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_RESPONSABILE_PUNTO_VENDITA"));
    }

    private boolean hasStoreAccess(Authentication authentication, Long storeId) {
        String requiredRole = "ROLE_store_" + storeId;

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals(requiredRole));
    }
}