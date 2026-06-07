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

    //Lista degli ordini di approvvigionamento (utili per storico e per seguire l'avanzamento)
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'OPERATORE_DI_MAGAZZINO')")
    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getOrders() {
        return ResponseEntity.ok(procurementService.getAllOrders());
    }

    //Creaz. di un nuovo ordine di approvvigionamento
    @PreAuthorize("hasRole('RESPONSABILE_APPROVVIGIONAMENTO')")
    @PostMapping
    public ResponseEntity<PurchaseOrder> addOrder(@RequestBody PurchaseOrder order) {
        return ResponseEntity.ok(procurementService.addOrder(order));
    }

    //Aggiornamento dello stato di un ordine esistente
    @PreAuthorize("hasAnyRole('RESPONSABILE_APPROVVIGIONAMENTO', 'OPERATORE_DI_MAGAZZINO')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(procurementService.updateOrderStatus(id, status));
    }
}