package com.taasselunga.pos.controller;

import com.taasselunga.pos.domain.Sale;
import com.taasselunga.pos.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/pos/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @PostMapping
    public ResponseEntity<String> registerSale(@RequestBody Sale sale) {
        saleService.registerSale(sale);
        return ResponseEntity.ok("Vendita registrata con successo");
    }
}