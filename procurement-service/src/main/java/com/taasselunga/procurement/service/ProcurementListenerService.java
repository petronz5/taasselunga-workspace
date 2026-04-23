package com.taasselunga.procurement.service;

import com.taasselunga.procurement.domain.PurchaseOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.Queue; // <-- Assicurati che ci sia questo import
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProcurementListenerService {

    private final ProcurementService procurementService;

    // Questa riga è la magia che risolve il crash: se la coda non c'è, la crea!
    @RabbitListener(queuesToDeclare = @Queue(name = "stock.alerts.queue", durable = "true"))
    public void handleStockAlert(String alertMessage) {
        System.out.println("🚨 Allarme scorta ricevuto dal Procurement: " + alertMessage);

        String randomOrderNumber = "ORD-AUTO-" + (int)(Math.random() * 1000);

        PurchaseOrder autoOrder = new PurchaseOrder(
                randomOrderNumber,
                "Fornitore Da Assegnare",
                0.0,
                "IN_ATTESA"
        );

        procurementService.addOrder(autoOrder);
        System.out.println("✅ Bozza ordine auto-generata: " + randomOrderNumber);
    }
}