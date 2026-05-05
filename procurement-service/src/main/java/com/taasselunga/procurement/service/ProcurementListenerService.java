package com.taasselunga.procurement.service;

import com.taasselunga.procurement.domain.PurchaseOrder;
import com.taasselunga.procurement.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import java.util.UUID;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProcurementListenerService {

    private final ProcurementService procurementService;

    @RabbitListener(queues = RabbitMQConfig.PROCUREMENT_QUEUE)
    public void handleStockAlert(String alertMessage) {
        System.out.println("Allarme scorta ricevuto dal Procurement: " + alertMessage);

        String orderNumber = "ORD-AUTO-" + UUID.randomUUID().toString().substring(0, 8);

        PurchaseOrder autoOrder = new PurchaseOrder(
                orderNumber,
                "Fornitore Da Assegnare",
                0.0,
                "IN_ATTESA"
        );

        procurementService.addOrder(autoOrder);

        System.out.println("Bozza d'ordine auto-generata: " + orderNumber);
    }
}