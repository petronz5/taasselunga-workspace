package com.taasselunga.inventory.controller;

import com.taasselunga.inventory.dto.ProductResponseDTO;
import com.taasselunga.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // Endpoint per Alessia (Dashboard Frontend)
    @GetMapping("/products")
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(inventoryService.getAllProductsWithStock());
    }

    // Endpoint per Antonio (Tablet Scarico Merci)
    @PostMapping("/receive")
    public ResponseEntity<String> receiveGoods(@RequestParam Long productId, @RequestParam Integer quantity) {
        inventoryService.receiveGoods(productId, quantity);
        return ResponseEntity.ok("Merce registrata con successo e giacenze aggiornate.");
    }

    @PostMapping("/products")
    public ResponseEntity<String> addProduct(@RequestBody com.taasselunga.inventory.dto.ProductRequestDTO request) {
        inventoryService.addProduct(request);
        return ResponseEntity.ok("Prodotto aggiunto con successo");
    }

    @PutMapping("/{productId}/deduct")
    public ResponseEntity<String> deductStock(@PathVariable Long productId, @RequestParam Integer quantity) {
        inventoryService.deductStock(productId, quantity);
        return ResponseEntity.ok("Giacenza aggiornata e controlli scorta effettuati.");
    }
}