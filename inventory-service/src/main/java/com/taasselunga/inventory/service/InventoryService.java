package com.taasselunga.inventory.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Base64;
import com.taasselunga.inventory.config.RabbitMQConfig;
import com.taasselunga.inventory.domain.Product;
import com.taasselunga.inventory.domain.Quantity;
import com.taasselunga.inventory.domain.Stock;
import com.taasselunga.inventory.domain.StockThreshold;
import com.taasselunga.inventory.dto.ProductResponseDTO;
import com.taasselunga.inventory.repository.ProductRepository;
import com.taasselunga.inventory.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    public Page<ProductResponseDTO> getAllProductsWithStock(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return productRepository.findAll(pageable).map(product -> {
            Stock stock = stockRepository.findByProductId(product.getId()).orElse(null);

            Integer qty = (stock != null)
                    ? stock.getAvailableQuantity().getValue()
                    : 0;

            Integer threshold = (stock != null)
                    ? stock.getThreshold().getMinimumLevel()
                    : 0;

            String imageBase64 = product.getImage() != null
                    ? Base64.getEncoder().encodeToString(product.getImage())
                    : null;

            return new ProductResponseDTO(product.getId(), product.getName(), product.getCategory(), qty, threshold, product.getPrice(), imageBase64, product.getBarcode());
        });
    }

    //receiveGoods() è invocato da ProcurementService.updateOrderStatus() tramite REST
    //receiveGoods() aggiorna anche lo stock dei prodotti nel magazzino e pubblica eventi asincroni rabbitmq
    @Transactional
    public void receiveGoods(Long productId, Integer quantityValue) {

        Stock stock = stockRepository.findByProductId(productId).orElseThrow(() -> new RuntimeException("Prodotto non trovato in magazzino"));

        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Prodotto non trovato"));

        // Aggiornamento istantaneo delle giacenze
        stock.increase(new Quantity(quantityValue));

        stockRepository.save(stock);

        System.out.println("Merce ricevuta per " + product.getName() + ". Nuova giacenza: " + stock.getAvailableQuantity().getValue());

        // Notifica ad Alessia: Antonio ha registrato la merce nel deposito
        String receivedMessage = String.format("Il magazzino ha registrato %d unità di %s nel deposito centrale.", quantityValue, product.getName());

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.PROCUREMENT_ROUTING_KEY,
                receivedMessage
        );

        System.out.println("Notifica inviata ad Alessia: " + receivedMessage);

        // Controllo soglia e notifica asincrona via RabbitMQ
        if (stock.isBelowThreshold()) {

            String message = String.format("%s è sotto scorta. Giacenza attuale: %d.", product.getName(), stock.getAvailableQuantity().getValue());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.LOW_STOCK_ROUTING_KEY,
                    message
            );

            System.out.println("Allarme lanciato: " + message);
        }
    }

    @Transactional
    public void addProduct(String name, String category, Double price, String barcode, Integer initialStock, Integer threshold, MultipartFile image) {

        try {
            Product product = new Product(name, category, price, image.getBytes(), barcode);

            product = productRepository.save(product);

            Stock stock = new Stock(product.getId(), new Quantity(initialStock), new StockThreshold(threshold));

            stockRepository.save(stock);

        } catch (IOException e) {
            throw new RuntimeException("Errore nella lettura dell'immagine", e);
        }
    }

    @Transactional
    public void deductStock(Long productId, Integer quantitySold) {

        // Controllo sulla quantità non negativa
        if (quantitySold == null || quantitySold <= 0) {
            throw new IllegalArgumentException("La quantità da scalare deve essere positiva");
        }

        // Recupero prodotto
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Prodotto non trovato")
                );

        // Recupero stock
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new RuntimeException("Prodotto non trovato nel magazzino")
                );

        // Creazione quantity
        Quantity soldQty = new Quantity(quantitySold);

        // Scalatura giacenza
        stock.decrease(soldQty);

        stockRepository.save(stock);

        System.out.println("Scalati " + quantitySold + " pezzi di " + product.getName() + ". Nuova giacenza: " + stock.getAvailableQuantity().getValue());

        // Controllo soglia minima
        if (stock.isBelowThreshold()) {

            String alertMsg = String.format("ATTENZIONE: %s è sceso sotto la soglia minima. Giacenza attuale: %d.", product.getName(), stock.getAvailableQuantity().getValue());

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.LOW_STOCK_ROUTING_KEY,
                    alertMsg
            );

            System.out.println("Allarme inviato a RabbitMQ per " + product.getName());
        }
    }


    @Transactional(readOnly = true)
    public void notifyLowStock(Long productId) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Prodotto non trovato in magazzino"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Prodotto non trovato"));

        String message = String.format(
                "Il magazzino segnala prodotto sotto soglia: %s. Giacenza attuale: %d, soglia minima: %d.",
                product.getName(),
                stock.getAvailableQuantity().getValue(),
                stock.getThreshold().getMinimumLevel()
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.LOW_STOCK_ROUTING_KEY,
                message
        );

        System.out.println("Sollecito approvvigionamento inviato via RabbitMQ: " + message);
    }

}