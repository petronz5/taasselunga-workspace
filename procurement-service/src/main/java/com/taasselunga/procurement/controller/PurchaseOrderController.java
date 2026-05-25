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

    // RESPONSABILE_APPROVVIGIONAMENTO può visualizzare gli ordini
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'OPERATORE_DI_MAGAZZINO')")
    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getOrders() {
        return ResponseEntity.ok(procurementService.getAllOrders());
    }

    // RESPONSABILE_APPROVVIGIONAMENTO può creare ordini di approvvigionamento
    @PreAuthorize("hasRole('RESPONSABILE_APPROVVIGIONAMENTO')")
    @PostMapping
    public ResponseEntity<PurchaseOrder> addOrder(@RequestBody PurchaseOrder order) {
        return ResponseEntity.ok(procurementService.addOrder(order));
    }

    // RESPONSABILE_APPROVVIGIONAMENTO può aggiornare lo stato ordine
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'OPERATORE_DI_MAGAZZINO')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(procurementService.updateOrderStatus(id, status));
    }
}