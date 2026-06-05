package com.taasselunga.inventory.controller;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import com.taasselunga.inventory.dto.ReplenishmentRequestDto;
import com.taasselunga.inventory.dto.ProductResponseDTO;
import com.taasselunga.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // Accessibile a RESPONSABILE_APPROVVIGIONAMENTO e OPERATORE_DI_MAGAZZINO
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'OPERATORE_DI_MAGAZZINO', 'RESPONSABILE_PUNTO_VENDITA')")
    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponseDTO>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size
    ) {
        return ResponseEntity.ok(inventoryService.getAllProductsWithStock(page, size));
    }

    // Solo OPERATORE_DI_MAGAZZINO può registrare la merce
    @PreAuthorize("hasRole('OPERATORE_DI_MAGAZZINO')")
    @PostMapping("/receive")
    public ResponseEntity<String> receiveGoods(
            @RequestParam Long productId,
            @RequestParam Integer quantity
    ) {
        inventoryService.receiveGoods(productId, quantity);
        return ResponseEntity.ok("Merce registrata con successo e giacenze aggiornate.");
    }

    // Solo RESPONSABILE_APPROVVIGIONAMENTO può aggiungere nuovi prodotti
    @PreAuthorize("hasRole('RESPONSABILE_APPROVVIGIONAMENTO')")
    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> addProduct(
            @RequestParam String name,
            @RequestParam String category,
            @RequestParam Double price,
            @RequestParam String barcode,
            @RequestParam Integer initialStock,
            @RequestParam Integer threshold,
            @RequestParam MultipartFile image
    ) {
        inventoryService.addProduct(name, category, price, barcode, initialStock, threshold, image);

        return ResponseEntity.ok("Prodotto aggiunto con successo");
    }

    // RESPONSABILE_APPROVVIGIONAMENTO, OPERATORE_DI_MAGAZZINO e RESPONSABILE_PUNTO_VENDITA possono aggiornare le giacenze
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'OPERATORE_DI_MAGAZZINO', 'RESPONSABILE_PUNTO_VENDITA')")
    @PutMapping("/{productId}/deduct")
    public ResponseEntity<String> deductStock(
            @PathVariable Long productId,
            @RequestParam Integer quantity
    ) {
        inventoryService.deductStock(productId, quantity);
        return ResponseEntity.ok("Giacenza aggiornata e controlli scorta effettuati.");
    }

    // Endpoint interno per comunicazione diretta tra microservizi POS → Inventory
    @PutMapping("/internal/{productId}/deduct")
    public ResponseEntity<String> deductStockInternal(
            @PathVariable Long productId,
            @RequestParam Integer quantity
    ) {
        inventoryService.deductStock(productId, quantity);
        return ResponseEntity.ok("Giacenza aggiornata.");
    }



    @PostMapping("/replenishment")
    public ResponseEntity<Void> receiveReplenishmentRequest(
            @RequestBody ReplenishmentRequestDto request
    ) {
        // per ora anche solo log va bene
        System.out.println("Replenishment request received from POS: " + request);

        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('OPERATORE_DI_MAGAZZINO')")
    @PostMapping("/{productId}/low-stock-alert")
    public ResponseEntity<String> notifyLowStock(@PathVariable Long productId) {
        inventoryService.notifyLowStock(productId);
        return ResponseEntity.ok("Sollecito approvvigionamento inviato via RabbitMQ.");
    }
}