package com.taasselunga.procurement.service;

import com.taasselunga.procurement.config.RabbitMQConfig;
import com.taasselunga.procurement.domain.PurchaseOrder;
import com.taasselunga.procurement.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcurementService {

    private final PurchaseOrderRepository purchaseOrderRepository; //Accesso agli ordini di approvvigionamento
    private final RabbitTemplate rabbitTemplate; //Pubblicazione eventi RabbitMQ


    // Lista con tutti gli ordini di approvvigionamento
    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }


    //Crea un nuovo ordine di approvvigionamento (Create.purchase.order)
    @Transactional
    public PurchaseOrder addOrder(PurchaseOrder order) {
        // Imposta la data di creazione dell'ordine
        order.setOrderDate(LocalDateTime.now());

        //Quando Alessia crea un ordine di approvig., questo parte verso il fornitore.
        //Nel backend appare come CREATO, nel frontend come IN CONSEGNA
        order.setStatus("CREATO");

        //Salva l'ordine nel database Procurement (tabella purchase_order)
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        //Creazione del messaggio di ordine creato
        String message = "Nuovo ordine creato: " + savedOrder.getOrderNumber() + " - Importo: " + String.format("%.2f", savedOrder.getTotalAmount());

        //pubblicazione del messaggio di ordine creato su rabbit
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.PURCHASE_ORDER_ROUTING_KEY,
                message
        );

        System.out.println("Evento procurement inviato a RabbitMQ: " + message);

        return savedOrder;
    }

    // Aggiorna lo stato di un ordine esistente
    @Transactional
    public PurchaseOrder updateOrderStatus(Long orderId, String status) {

        //Recupera l'ordine dal database
        PurchaseOrder order = purchaseOrderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Ordine non trovato"));

        //Memorizza lo stato precedente
        String oldStatus = order.getStatus();

        //Aggiorna lo stato dell'ordine: lo stato CONSEGNATO verrà impostato solo quando la merce
        //arriverà effettivamente in magazzino (e solo in quel momento, nel frontend, le giacenze verranno aggiornate).
        order.setStatus(status);

        //Salva le modifiche nel database Procurement (tabella purchase_order)
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        // Verifica il passaggio allo stato CONSEGNATO
        boolean isNowDelivered = "CONSEGNATO".equalsIgnoreCase(status);
        boolean wasAlreadyDelivered = "CONSEGNATO".equalsIgnoreCase(oldStatus);

        //Controllo sulla presenza di prodotto e quantità
        if (isNowDelivered && !wasAlreadyDelivered) {
            if (order.getProductId() == null || order.getQuantity() == null) {
                throw new RuntimeException("Impossibile aggiornare stock: prodotto o quantità mancanti");
            }
        }

        return savedOrder;
    }
}