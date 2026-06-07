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

    // Recupera i prodotti disponibili dall'Inventory Service
    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @GetMapping("/products")
    public ResponseEntity<Object> getProducts(Authentication authentication) {

        String token = getToken(authentication); // Estrae il token JWT dell'utente autenticato

        return ResponseEntity.ok(posService.getProductsFromInventory(token)); // Richiede i prodotti all'Inventory Service
    }

    //Creazione una richiesta di rifornimento per il punto vendita (Replenishment Request)
    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @PostMapping("/replenishment")
    public ResponseEntity<ReplenishmentRequest> requestReplenishment(
            @RequestParam Long storeId,
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            Authentication authentication
    ) {
        //Verifica che l'utente autenticato sia associato al punto vendita richiesto
        if (!hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        //Estrae il token JWT dell'utente autenticato
        String token = getToken(authentication);

        //Creazione effettiva della richiesta di rifornimento
        ReplenishmentRequest request = posService.createReplenishmentRequest(storeId, productId, quantity, token);

        return ResponseEntity.ok(request);
    }

    //Restituisce le richieste di rifornimento per specifico punto vendita
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'RESPONSABILE_PUNTO_VENDITA', 'OPERATORE_DI_MAGAZZINO')")
    @GetMapping("/store/{storeId}/requests")
    public ResponseEntity<List<ReplenishmentRequest>> getRequestsByStore(
            @PathVariable Long storeId,
            Authentication authentication
    ) {
        //Verifica che il responsabile possa accedere a quel determinato punto vendita
        if (isStoreManager(authentication) && !hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        // Recupera le richieste di rifornimento del punto vendita
        return ResponseEntity.ok(posService.getStoreRequests(storeId));
    }

    //Restituisce, per l'operatore di magazzino, tutte le richieste di rifornimento
    //provenienti da ogni punto vendita
    @PreAuthorize("hasRole('OPERATORE_DI_MAGAZZINO')")
    @GetMapping("/requests")
    public ResponseEntity<List<ReplenishmentRequest>> getAllRequests() {
        return ResponseEntity.ok(posService.getAllRequests());
    }

    // Aggiorna lo stato di una richiesta di rifornimento
    @PreAuthorize("hasRole('OPERATORE_DI_MAGAZZINO')")
    @PatchMapping("/requests/{id}/status")
    public ResponseEntity<ReplenishmentRequest> updateRequestStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication
    ) {
        //Estrae il token JWT dell'utente autenticato
        String token = getToken(authentication);

        // Aggiorna lo stato della richiesta
        return ResponseEntity.ok(posService.updateRequestStatus(id, status, token));
    }

    //Prepara spedizione da deposito verso un punto vendita
    @PreAuthorize("hasRole('OPERATORE_DI_MAGAZZINO')")
    @PostMapping("/prepare-shipment")
    public ResponseEntity<Void> prepareShipment(
            @RequestParam Long storeId,
            @RequestParam Long productId,
            @RequestParam Integer quantity,
            Authentication authentication
    ) {
        //Estrae token JWT dell'utente autenticato
        String token = getToken(authentication);

        //Avvia il processo di spedizione verso il punto vendita
        posService.prepareShipment(storeId, productId, quantity, token);

        return ResponseEntity.ok().build();
    }

    //Restituisce le giacenze relative al singolo punto vendita
    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @GetMapping("/store-stock/{storeId}")
    public ResponseEntity<List<StoreStock>> getStoreStock(
            @PathVariable Long storeId,
            Authentication authentication
    ) {
        // Verifica che il responsabile possa accedere al punto vendita richiesto
        if (!hasStoreAccess(authentication, storeId)) {
            return ResponseEntity.status(403).build();
        }

        // Recupera le giacenze del punto vendita
        return ResponseEntity.ok(posService.getStoreStock(storeId));
    }

    //Estrae il token JWT dell'utente autenticato
    private String getToken(Authentication authentication) {
        return ((JwtAuthenticationToken) authentication).getToken().getTokenValue();
    }

    //Controllo se l'utente è un responsabile di punto vendita
    private boolean isStoreManager(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_RESPONSABILE_PUNTO_VENDITA"));
    }


    //Verifica che il responsabile punto vendita possa accedere solo al suo punto vendita
    //(Luigi può accedere solo al POS 1 e non agli altri)
    private boolean hasStoreAccess(Authentication authentication, Long storeId) {
        String requiredRole = "ROLE_store_" + storeId;

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals(requiredRole));
    }
}