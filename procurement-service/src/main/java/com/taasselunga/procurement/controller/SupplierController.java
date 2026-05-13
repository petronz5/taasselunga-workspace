package com.taasselunga.procurement.controller;

import com.taasselunga.procurement.domain.Supplier;
import com.taasselunga.procurement.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procurement/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    // RESPONSABILE_APPROVVIGIONAMENTO può visualizzare i fornitori
    @PreAuthorize("hasRole('RESPONSABILE_APPROVVIGIONAMENTO')")
    @GetMapping
    public ResponseEntity<List<Supplier>> getSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    // Solo RESPONSABILE_APPROVVIGIONAMENTO può aggiungere nuovi fornitori
    @PreAuthorize("hasRole('RESPONSABILE_APPROVVIGIONAMENTO')")
    @PostMapping
    public ResponseEntity<String> addSupplier(@RequestBody Supplier supplier) {
        supplierService.addSupplier(supplier);
        return ResponseEntity.ok("Fornitore salvato con successo");
    }
}