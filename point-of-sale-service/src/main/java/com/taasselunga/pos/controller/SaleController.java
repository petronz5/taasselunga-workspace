package com.taasselunga.pos.controller;

import com.taasselunga.pos.domain.Sale;
import com.taasselunga.pos.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/pos/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    // RESPONSABILE_APPROVVIGIONAMENTO e RESPONSABILE_PUNTO_VENDITA possono visualizzare le vendite
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'RESPONSABILE_PUNTO_VENDITA')")
    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // Solo RESPONSABILE_PUNTO_VENDITA possono registrare vendite
    @PreAuthorize("hasRole('RESPONSABILE_PUNTO_VENDITA')")
    @PostMapping
    public ResponseEntity<String> registerSale(@RequestBody Sale sale) {
        saleService.registerSale(sale);
        return ResponseEntity.ok("Vendita registrata con successo");
    }
}