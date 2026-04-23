package com.taasselunga.pos.service;

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

    // Luigi crea una richiesta di rifornimento
    @Transactional
    public ReplenishmentRequest createReplenishmentRequest(Long storeId, Long productId, Integer quantity) {
        ReplenishmentRequest request = new ReplenishmentRequest(storeId, productId, quantity);
        requestRepository.save(request);

        // Notifica il magazzino centrale (Inventory MS) tramite RabbitMQ
        String message = String.format("Negozio %d richiede %d unità del prodotto %d (Req ID: %d)",
                storeId, quantity, productId, request.getRequestId());

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.REPLENISHMENT_ROUTING_KEY, message);

        System.out.println("✅ Richiesta di rifornimento creata e inviata al polo logistico!");
        return request;
    }

    // Luigi visualizza lo stato delle sue richieste
    public List<ReplenishmentRequest> getStoreRequests(Long storeId) {
        return requestRepository.findByStoreId(storeId);
    }
}