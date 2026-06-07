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
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PointOfSaleService {

    private final ReplenishmentRequestRepository requestRepository; //Accesso alle richieste di rifornimento
    private final RabbitTemplate rabbitTemplate; //Pubblicazione eventi Rabbit
    private final InventoryClient inventoryClient; //Client REST verso Inventory
    private final StoreStockRepository storeStockRepository; //Accesso alle giacenze dei punti vendita

    // Crea una richiesta di rifornimento (lato punto vendita)
    @Transactional
    public ReplenishmentRequest createReplenishmentRequest(Long storeId, Long productId, Integer quantity, String token) {
        // Crea e salva la richiesta nel database db_pos
        ReplenishmentRequest request = new ReplenishmentRequest(storeId, productId, quantity);
        ReplenishmentRequest savedRequest = requestRepository.save(request);

        //Comunica richiesta di rifornimento a Inventory Service tramite REST
        //il POS deve sapere subito se la richiesta è stata ricevuta.
        inventoryClient.sendReplenishmentRequest(storeId, productId, quantity, token);

        //Recupera nome prodotto
        String productName = getProductName(productId, token);

        //Crea il messaggio di notifica da POS a Inventory
        String message = String.format("Il punto vendita %d ha richiesto %d unità di %s.", storeId, quantity, productName);

        //Pubblica messaggio su Rabbit (comunicazione asinc. utilizzata  per notificare gli altri servizi)
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.POS_ROUTING_KEY,
                message
        );

        System.out.println("Richiesta di rifornimento creata e comunicata a Inventory: " + message);

        return savedRequest;
    }

    //Recupera i prodotti disponibili nel magazzino tramite chiamata REST a Inventory Service
    public Object getProductsFromInventory(String token) {
        return inventoryClient.getProductsWithStock(token);
    }

    //Restituisce le richieste di rifornimento di uno specifico punto vendita
    public List<ReplenishmentRequest> getStoreRequests(Long storeId) {
        return requestRepository.findByStoreId(storeId);
    }

    //Restituisce tutte le richieste di rifornimento provenienti da tutti i punti vendita
    public List<ReplenishmentRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    //Aggiorna stato di una richiesta di rifornimento
    @Transactional
    public ReplenishmentRequest updateRequestStatus(Long id, String status, String token) {
        //Recupera la richiesta dal database db_POS (tabella replenishment_request)
        ReplenishmentRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Richiesta non trovata"));

        //Memorizza stato precedente
        String oldStatus = request.getStatus() != null
                ? request.getStatus().getStatusName()
                : null;

        //Verifica se richiesta sta passando allo stato 'SPEDITO'
        boolean isNowShipped = "SPEDITO".equalsIgnoreCase(status);
        boolean wasAlreadyShipped = "SPEDITO".equalsIgnoreCase(oldStatus);

        //Se la richiesta viene spedita, due operazini vengono fatte:
        if (isNowShipped && !wasAlreadyShipped) {
            validateRequest(request);

            // #1)Scala lo stock del magazzino centrale tramite chiamata REST a Inventory Service
            inventoryClient.deductStock(request.getProductId(), request.getRequestedQuantity(), token);

            // #2)aggiorna lo stock del singolo punto vendita
            updateStoreStockAfterShipment(request);
        }

        //Aggiorna stato richiesta
        request.setStatus(new RequestStatus(status));

        return requestRepository.save(request);
    }

    //Prepara una spedizione dal magazzino centrale verso un punto vendita
    @Transactional
    public void prepareShipment(Long storeId, Long productId, Integer quantity, String token) {
        //Controlla che prodotto e quantità siano presenti
        if (productId == null || quantity == null) {
            throw new RuntimeException(
                    "Prodotto o quantità mancanti"
            );
        }

        //Controlla validità qtà
        if (quantity <= 0) {throw new RuntimeException("Quantità non valida");}

        //Scala lo stock del magazzino centrale tramite chiamata REST a Inventory Service
        inventoryClient.deductStock(productId, quantity, token);

        //Recupera stock punto vendita o lo crea se non esiste
        StoreStock storeStock = storeStockRepository
                .findByStoreIdAndProductId(storeId, productId)
                .orElseGet(() -> {
                    StoreStock newStock = new StoreStock();
                    newStock.setStoreId(storeId);
                    newStock.setProductId(productId);
                    newStock.setAvailableQuantity(0);
                    return newStock;
                });

        //Qtà attuale disponibile nel punto vendita di un prodotto
        Integer currentQuantity = storeStock.getAvailableQuantity() != null
                ? storeStock.getAvailableQuantity()
                : 0;

        //Aumenta stock punto vendita
        storeStock.setAvailableQuantity(currentQuantity + quantity);

        //Salva nuova giacenza del punto vendita
        storeStockRepository.save(storeStock);

        String productName = getProductName(productId, token);

        String message = String.format("Spedizione preparata verso punto vendita %d: %d unità di %s.", storeId, quantity, productName);

        System.out.println("Spedizione preparata: " + message);
    }

    //Verifica che la richiesta abbia dati validi prima della spedizione
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

    //Aggiorna stock del prodotto in un punto vendita dopo una spedizione
    private void updateStoreStockAfterShipment(ReplenishmentRequest request) {
        //Recupera stock del prodotto nel punto vendita
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

        //Quantità attuale del prodotto nel punto vendita
        Integer currentQuantity = storeStock.getAvailableQuantity() != null
                ? storeStock.getAvailableQuantity()
                : 0;

        Integer requestedQuantity = request.getRequestedQuantity();

        //Aggiunge la nuova quantità spedita dal magazzino
        //allo stock già presente nel singolo punto vendita
        storeStock.setAvailableQuantity(currentQuantity + requestedQuantity);

        //Salva il nuovo stock per quel prodotto nel POS
        storeStockRepository.save(storeStock);
    }

    //Recupera nome del prodotto tramite Inventory Service
    private String getProductName(Long productId, String token) {
        try {
            Object response = inventoryClient.getProductsWithStock(token);

            //Nome prodotto preso da pagina implementata col paginator
            if (response instanceof Map<?, ?> map && map.get("content") instanceof List<?> content) {
                return findProductNameInList(content, productId);
            }

            //Nome prodotto preso da pagina classica (lista semplice di prodotti)
            if (response instanceof List<?> list) {
                return findProductNameInList(list, productId);
            }

        } catch (Exception error) {
            System.out.println("Impossibile recuperare nome prodotto: " + error.getMessage());
        }

        return "prodotto " + productId;
    }

    //Cerca nome prodotto dentro una lista ricevuta da Inventory
    private String findProductNameInList(List<?> products, Long productId) {
        //Scorre tutti i prodotti ricevuti
        for (Object item : products) {
            //Verifica che l'elemento sia una Map con i dati del prodotto
            if (item instanceof Map<?, ?> productMap) {
                Object idValue = productMap.get("id");
                Object nameValue = productMap.get("name");

                // Controlla che id e nome siano presenti
                if (idValue != null && nameValue != null) {
                    Long id = Long.valueOf(idValue.toString());

                    // Se il prodotto cercato è stato trovato, lorestituisce
                    if (id.equals(productId)) {
                        return nameValue.toString();
                    }
                }
            }
        }

        return "prodotto " + productId;
    }

    //Restituisce giacenze di uno specifico punto vendita
    public List<StoreStock> getStoreStock(Long storeId) {
        return storeStockRepository.findByStoreId(storeId);
    }
}