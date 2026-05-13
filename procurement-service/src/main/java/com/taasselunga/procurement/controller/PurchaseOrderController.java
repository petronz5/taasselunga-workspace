package com.taasselunga.procurement.controller;

import com.taasselunga.procurement.domain.PurchaseOrder;
import com.taasselunga.procurement.service.ProcurementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/procurement/orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final ProcurementService procurementService;

    // RESPONSABILE_APPROVVIGIONAMENTO approvvigionamento può visualizzare gli ordini
    @PreAuthorize("hasRole('RESPONSABILE_APPROVVIGIONAMENTO')")
    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getOrders() {
        return ResponseEntity.ok(procurementService.getAllOrders());
    }

    // Solo RESPONSABILE_APPROVVIGIONAMENTO può creare ordini di approvvigionamento
    @PreAuthorize("hasRole('RESPONSABILE_APPROVVIGIONAMENTO')")
    @PostMapping
    public ResponseEntity<String> addOrder(@RequestBody PurchaseOrder order) {
        procurementService.addOrder(order);
        return ResponseEntity.ok("Ordine creato con successo");
    }
}