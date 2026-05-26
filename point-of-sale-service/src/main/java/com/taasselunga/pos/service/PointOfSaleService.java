package com.taasselunga.pos.service;

import com.taasselunga.pos.client.InventoryClient;
import com.taasselunga.pos.config.RabbitMQConfig;
import com.taasselunga.pos.domain.ReplenishmentRequest;
import com.taasselunga.pos.domain.RequestStatus;
import com.taasselunga.pos.domain.StoreStock;
import com.taasselunga.pos.repository.ReplenishmentRequestRepository;
import com.taasselunga.pos.repository.StoreStockRepository;
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
    private final StoreStockRepository storeStockRepository;

    @Transactional
    public ReplenishmentRequest createReplenishmentRequest(
            Long storeId,
            Long productId,
            Integer quantity,
            String token
    ) {
        ReplenishmentRequest request = new ReplenishmentRequest(storeId, productId, quantity);
        ReplenishmentRequest savedRequest = requestRepository.save(request);

        inventoryClient.sendReplenishmentRequest(
                storeId,
                productId,
                quantity,
                token
        );

        String message = String.format(
                "Nuova richiesta di rifornimento dal punto vendita %d: prodotto %d, quantità %d, richiesta ID %d",
                storeId,
                productId,
                quantity,
                savedRequest.getRequestId()
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.POS_ROUTING_KEY,
                message
        );

        System.out.println("Richiesta di rifornimento creata e comunicata a Inventory: " + message);

        return savedRequest;
    }

    public Object getProductsFromInventory(String token) {
        return inventoryClient.getProductsWithStock(token);
    }

    public List<ReplenishmentRequest> getStoreRequests(Long storeId) {
        return requestRepository.findByStoreId(storeId);
    }

    public List<ReplenishmentRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    @Transactional
    public ReplenishmentRequest updateRequestStatus(
            Long id,
            String status,
            String token
    ) {
        ReplenishmentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Richiesta non trovata"));

        String oldStatus = request.getStatus() != null
                ? request.getStatus().getStatusName()
                : null;

        boolean isNowShipped = "SPEDITO".equalsIgnoreCase(status);
        boolean wasAlreadyShipped = "SPEDITO".equalsIgnoreCase(oldStatus);

        if (isNowShipped && !wasAlreadyShipped) {
            validateRequest(request);

            inventoryClient.deductStock(
                    request.getProductId(),
                    request.getRequestedQuantity(),
                    token
            );

            updateStoreStockAfterShipment(request);
        }

        request.setStatus(new RequestStatus(status));

        return requestRepository.save(request);
    }

    private void validateRequest(ReplenishmentRequest request) {
        if (request.getProductId() == null || request.getRequestedQuantity() == null) {
            throw new RuntimeException(
                    "Impossibile spedire: prodotto o quantità mancanti"
            );
        }

        if (request.getRequestedQuantity() <= 0) {
            throw new RuntimeException(
                    "Impossibile spedire: quantità richiesta non valida"
            );
        }
    }

    private void updateStoreStockAfterShipment(ReplenishmentRequest request) {
        StoreStock storeStock = storeStockRepository
                .findByStoreIdAndProductId(
                        request.getStoreId(),
                        request.getProductId()
                )
                .orElseThrow(() -> new RuntimeException(
                        "Stock punto vendita non trovato per store "
                                + request.getStoreId()
                                + " e prodotto "
                                + request.getProductId()
                ));

        Integer currentQuantity = storeStock.getAvailableQuantity() != null
                ? storeStock.getAvailableQuantity()
                : 0;

        Integer requestedQuantity = request.getRequestedQuantity();

        storeStock.setAvailableQuantity(currentQuantity + requestedQuantity);

        storeStockRepository.save(storeStock);
    }

    public List<StoreStock> getStoreStock(Long storeId) {
        return storeStockRepository.findByStoreId(storeId);
    }
}