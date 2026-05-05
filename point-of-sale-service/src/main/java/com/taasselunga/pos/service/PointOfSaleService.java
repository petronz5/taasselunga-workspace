package com.taasselunga.pos.service;

import com.taasselunga.pos.client.InventoryClient;
import com.taasselunga.pos.config.RabbitMQConfig;
import com.taasselunga.pos.domain.ReplenishmentRequest;
import com.taasselunga.pos.repository.ReplenishmentRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PointOfSaleService {

    private final ReplenishmentRequestRepository requestRepository;
    private final RabbitTemplate rabbitTemplate;

    private final InventoryClient inventoryClient;

    // Luigi crea una richiesta di rifornimento dal punto vendita
    @Transactional
    public ReplenishmentRequest createReplenishmentRequest(Long storeId, Long productId, Integer quantity) {
        ReplenishmentRequest request = new ReplenishmentRequest(storeId, productId, quantity);
        requestRepository.save(request);

        // POS chiama Inventory via REST per aggiornare lo stock
        inventoryClient.deductStock(productId, quantity);

        String message = String.format(
                "Nuova richiesta di rifornimento dal punto vendita %d: prodotto %d, quantità %d, richiesta ID %d",
                storeId,
                productId,
                quantity,
                request.getRequestId()
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.POS_ROUTING_KEY,
                message
        );

        System.out.println("Richiesta di rifornimento creata e notifica inviata: " + message);

        return request;
    }

    // Luigi visualizza lo stato delle sue richieste
    public List<ReplenishmentRequest> getStoreRequests(Long storeId) {
        return requestRepository.findByStoreId(storeId);
    }

    // POS legge prodotti e stock da Inventory
    public List<?> getProductsFromInventory() {
        return inventoryClient.getProductsWithStock();
    }
}