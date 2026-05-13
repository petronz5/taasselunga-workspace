package com.taasselunga.pos.service;

import com.taasselunga.pos.domain.Sale;
import com.taasselunga.pos.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;

    // Client HTTP per comunicare con Inventory MS
    private final RestTemplate restTemplate;

    // URL configurabile tramite application.yml
    @Value("${inventory.service.url}")
    private String inventoryServiceUrl;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public void registerSale(Sale sale) {

        // Endpoint interno Inventory usato dal POS per decrementare lo stock
        String inventoryUrl = inventoryServiceUrl + "/api/inventory/internal/"
                + sale.getProductId()
                + "/deduct?quantity="
                + sale.getQuantity();

        try {
            // Chiamata HTTP verso Inventory MS
            restTemplate.put(inventoryUrl, null);
            System.out.println("Magazzino avvisato della vendita.");

        } catch (Exception e) {
            // Gestione errore comunicazione microservizio
            throw new RuntimeException("Errore di comunicazione col Magazzino: " + e.getMessage());
        }

        // Salvataggio vendita nel database POS
        saleRepository.save(sale);
    }
}