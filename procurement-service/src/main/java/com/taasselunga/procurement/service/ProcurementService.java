package com.taasselunga.procurement.service;

import com.taasselunga.procurement.config.RabbitMQConfig;
import com.taasselunga.procurement.domain.PurchaseOrder;
import com.taasselunga.procurement.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcurementService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final RabbitTemplate rabbitTemplate;
    private final RestTemplate restTemplate;

    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }

    @Transactional
    public PurchaseOrder addOrder(PurchaseOrder order) {
        order.setOrderDate(LocalDateTime.now());

        //Quando Alessia crea un ordine, l'ordine parte verso il fornitore.
        //Nel backend appare come CREATO, nel frontend come IN CONSEGNA
        order.setStatus("CREATO");

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        String message = "Nuovo ordine procurement creato: " + savedOrder.getOrderNumber() +
                " - Fornitore: " + savedOrder.getSupplierName() +
                " - Importo: " + savedOrder.getTotalAmount();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.PURCHASE_ORDER_ROUTING_KEY,
                message
        );

        System.out.println("Evento procurement inviato a RabbitMQ: " + message);

        return savedOrder;
    }

    @Transactional
    public PurchaseOrder updateOrderStatus(Long orderId, String status) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Ordine non trovato"));

        String oldStatus = order.getStatus();

        // Lo stato CONSEGNATO verrà impostato solo quando la merce arriverà effettivamente in magazzino.
        // Solo in quel momento le giacenze verranno aggiornate.

        order.setStatus(status);

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        boolean isNowDelivered = "CONSEGNATO".equalsIgnoreCase(status);
        boolean wasAlreadyDelivered = "CONSEGNATO".equalsIgnoreCase(oldStatus);

        if (isNowDelivered && !wasAlreadyDelivered) {
            if (order.getProductId() == null || order.getQuantity() == null) {
                throw new RuntimeException(
                        "Impossibile aggiornare stock: prodotto o quantità mancanti"
                );
            }

            restTemplate.postForObject(
                    "http://inventory-service:8081/api/inventory/internal/receive?productId="
                            + order.getProductId()
                            + "&quantity="
                            + order.getQuantity(),
                    null,
                    String.class
            );
        }

        return savedOrder;
    }
}