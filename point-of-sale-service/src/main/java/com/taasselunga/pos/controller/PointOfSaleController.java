package com.taasselunga.pos.controller;

import com.taasselunga.pos.domain.ReplenishmentRequest;
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

    // Solo il responsabile punto vendita può creare richieste di rifornimento.
    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @PostMapping("/replenishment")
    public ResponseEntity<ReplenishmentRequest> requestReplenishment(@RequestParam Long storeId, @RequestParam Long productId, @RequestParam Integer quantity, Authentication authentication) {

        // Il responsabile punto vendita può creare richieste solo per il proprio store.
        if (!hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        // Recupera il JWT ricevuto dal frontend per inoltrarlo a Inventory.
        String token = ((JwtAuthenticationToken) authentication).getToken().getTokenValue();

        ReplenishmentRequest request = posService.createReplenishmentRequest(storeId, productId, quantity, token);

        return ResponseEntity.ok(request);
    }

    // Il responsabile punto vendita vede solo il proprio store. Magazzino e approvvigionamento possono vedere tutte le richieste.
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'RESPONSABILE_PUNTO_VENDITA', 'OPERATORE_DI_MAGAZZINO')")
    @GetMapping("/store/{storeId}/requests")
    public ResponseEntity<List<ReplenishmentRequest>> getRequestsByStore(@PathVariable Long storeId, Authentication authentication) {

        // Il controllo sullo store vale solo per il responsabile punto vendita.
        if (isStoreManager(authentication) && !hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(posService.getStoreRequests(storeId));
    }

    // Verifica se l’utente autenticato è responsabile punto vendita.
    private boolean isStoreManager(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_RESPONSABILE_PUNTO_VENDITA"));
    }

    // Verifica se l’utente possiede il ruolo dello store richiesto: store_1, store_2, store_3, ...
    private boolean hasStoreAccess(Authentication authentication, Long storeId) {
        String requiredRole = "ROLE_store_" + storeId;

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals(requiredRole));
    }
}