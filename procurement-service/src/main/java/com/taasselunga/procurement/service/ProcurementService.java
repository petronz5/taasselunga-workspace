package com.taasselunga.procurement.service;

import com.taasselunga.procurement.config.RabbitMQConfig;
import com.taasselunga.procurement.domain.PurchaseOrder;
import com.taasselunga.procurement.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcurementService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final RabbitTemplate rabbitTemplate;

    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }

    public void addOrder(PurchaseOrder order) {
        order.setOrderDate(LocalDate.now());

        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        String message = "Nuovo ordine procurement creato: " + savedOrder.getOrderNumber() +
                " - Fornitore: " + savedOrder.getSupplierName() +
                " - Importo: " + savedOrder.getTotalAmount();

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.PURCHASE_ORDER_ROUTING_KEY, message);

        System.out.println("Evento procurement inviato a RabbitMQ: " + message);
    }
}