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
    private final StockRepository stockRepository;  //Accesso ai dati delle giacenze
    private final ProductRepository productRepository; //Accesso ai dati dei prodotti
    private final RabbitTemplate rabbitTemplate; //Usato per pubblicare eventi su Rabbit

    // Recupera i prodotti con le relative giacenze
    public Page<ProductResponseDTO> getAllProductsWithStock(int page, int size) {
        Pageable pageable = PageRequest.of(page, size); //Configurazione per paginator

        return productRepository.findAll(pageable).map(product -> {
            //Recupera lo stock associato al prodotto
            Stock stock = stockRepository.findByProductId(product.getId()).orElse(null);

            //Estrazione vera e propria della quantità del prodotto
            Integer qty = (stock != null)
                    ? stock.getAvailableQuantity().getValue()
                    : 0;

            //Soglia minima di scorta
            Integer threshold = (stock != null)
                    ? stock.getThreshold().getMinimumLevel()
                    : 0;

            //Immagine modificata per metterla direttamente nel DB con bytea
            String imageBase64 = product.getImage() != null
                    ? Base64.getEncoder().encodeToString(product.getImage())
                    : null;

            //Costruzione del DTO restituito al frontend
            return new ProductResponseDTO(product.getId(), product.getName(), product.getCategory(), qty, threshold, product.getPrice(), imageBase64, product.getBarcode());
        });
    }

    //receiveGoods() è invocato da ProcurementService.updateOrderStatus() tramite REST
    //receiveGoods() aggiorna anche lo stock dei prodotti nel magazzino e pubblica eventi asincroni rabbitmq
    @Transactional
    public void receiveGoods(Long productId, Integer quantityValue) {

        //Recupera stock associato al prodotto
        Stock stock = stockRepository.findByProductId(productId).orElseThrow(() -> new RuntimeException("Prodotto non trovato in magazzino"));

        //Recupera prodotto da catalogo
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Prodotto non trovato"));

        //Incremento delle quantità di un prodotto in magazzino
        stock.increase(new Quantity(quantityValue));

        stockRepository.save(stock); //Salvataggio della nuova giacenza nel database

        System.out.println("Merce ricevuta per " + product.getName() + ". Nuova giacenza: " + stock.getAvailableQuantity().getValue());

        //Crea messaggio di notifica per il reparto approvvigionamento
        //Notifica ad Alessia: Antonio ha registrato la merce nel deposito
        String receivedMessage = String.format("Il magazzino ha registrato %d unità di %s nel deposito centrale.", quantityValue, product.getName());

        //Pubblicaz. della notifica su RabbitMQ
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.PROCUREMENT_ROUTING_KEY,
                receivedMessage
        );

        System.out.println("Notifica inviata ad Alessia: " + receivedMessage);

        //Verifica se il prodotto è sotto la soglia minima
        if (stock.isBelowThreshold()) {

            String message = String.format("%s è sotto scorta. Giacenza attuale: %d.", product.getName(), stock.getAvailableQuantity().getValue());

            //Pubblicaz. su Rabbit di messaggio di allarme
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.LOW_STOCK_ROUTING_KEY,
                    message
            );
            System.out.println("Allarme lanciato: " + message);
        }
    }

    //crea nuovo prodotto col relativo stock iniziale
    @Transactional
    public void addProduct(String name, String category, Double price, String barcode, Integer initialStock, Integer threshold, MultipartFile image) {

        try {
            //crea il nuovo prodotto
            Product product = new Product(name, category, price, image.getBytes(), barcode);

            //Salva il prodotto nel database inventory (tabella product)
            product = productRepository.save(product);

            //Crea lo stock iniziale associato al prodotto
            Stock stock = new Stock(product.getId(), new Quantity(initialStock), new StockThreshold(threshold));

            // Salva lo stock nel database Inventory (tabella stock)
            stockRepository.save(stock);

        } catch (IOException e) {
            throw new RuntimeException("Errore nella lettura dell'immagine", e);
        }
    }

    //Scala quantità disponibile di un prodotto e verifica se è sotto scorta
    @Transactional
    public void deductStock(Long productId, Integer quantitySold) {

        //Controllo sulla quantità non negativa
        if (quantitySold == null || quantitySold <= 0) {
            throw new IllegalArgumentException("La quantità da scalare deve essere positiva");
        }

        //Recupero del prodotto nel catalogo
        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Prodotto non trovato")
                );

        //Recupero dello stock associato al prodotto
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() ->
                        new RuntimeException("Prodotto non trovato nel magazzino")
                );

        //Definisce quantità da scalare e la scala effettivamente dal magazzino
        Quantity soldQty = new Quantity(quantitySold);
        stock.decrease(soldQty);

        //Salva la nuova quantità del prodotto nel database Inventory (tabella stock)
        stockRepository.save(stock);

        System.out.println("Scalati " + quantitySold + " pezzi di " + product.getName() + ". Nuova giacenza: " + stock.getAvailableQuantity().getValue());

        //Verifica se il prodotto è sotto la soglia minima
        if (stock.isBelowThreshold()) {

            //Genera un messaggio di allerta
            String alertMsg = String.format("ATTENZIONE: %s è sceso sotto la soglia minima. Giacenza attuale: %d.", product.getName(), stock.getAvailableQuantity().getValue());

            //Pubblica l'evento di sotto scorta su Rabbit se prodotto è sotto soglia min.
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.LOW_STOCK_ROUTING_KEY,
                    alertMsg
            );

            System.out.println("Allarme inviato a RabbitMQ per " + product.getName());
        }
    }


    //SOLLECITO APPROVVIGIONAMENTO: invio di una notifica dell'operatore di magazzino
    //per segnalare prodotto sotto scorta al dipartim. di approvvigionam.
    @Transactional(readOnly = true)
    public void notifyLowStock(Long productId) {

        //Recupera lo stock associato al prodotto
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Prodotto non trovato in magazzino"));

        //Recupera il prodotto dal catalogo
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Prodotto non trovato"));

        //Genera un messaggio di allerta per l'approvvigionamento
        String message = String.format(
                "Il magazzino segnala prodotto sotto soglia: %s. Giacenza attuale: %d, soglia minima: %d.",
                product.getName(),
                stock.getAvailableQuantity().getValue(),
                stock.getThreshold().getMinimumLevel()
        );

        //Pubblica l'evento di sotto scorta su Rabbit
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.LOW_STOCK_ROUTING_KEY,
                message
        );

        System.out.println("Sollecito approvvigionamento inviato via RabbitMQ: " + message);
    }

}