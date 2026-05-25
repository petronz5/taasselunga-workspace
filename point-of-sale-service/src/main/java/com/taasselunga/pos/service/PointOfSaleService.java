package com.taasselunga.pos.service;

import com.taasselunga.pos.domain.RequestStatus;
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

    // Crea una richiesta di rifornimento dal punto vendita
    @Transactional
    public ReplenishmentRequest createReplenishmentRequest(
            Long storeId,
            Long productId,
            Integer quantity,
            String token
    ) {
        ReplenishmentRequest request = new ReplenishmentRequest(storeId, productId, quantity);
        requestRepository.save(request);

        // POS chiama Inventory via REST passando il token JWT ricevuto
        inventoryClient.deductStock(productId, quantity, token);

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

    // Recupera le richieste associate a uno store
    public List<ReplenishmentRequest> getStoreRequests(Long storeId) {
        return requestRepository.findByStoreId(storeId);
    }

    // POS legge prodotti e stock da Inventory usando il token JWT
    public List<?> getProductsFromInventory(String token) {
        return inventoryClient.getProductsWithStock(token);
    }

    public List<ReplenishmentRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    public ReplenishmentRequest updateRequestStatus(Long id, String status) {
        ReplenishmentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Richiesta non trovata"));

        request.setStatus(new RequestStatus(status));

        return requestRepository.save(request);
    }
}