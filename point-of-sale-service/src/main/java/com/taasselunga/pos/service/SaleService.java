package com.taasselunga.pos.service;

import com.taasselunga.pos.domain.Sale;
import com.taasselunga.pos.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final RestTemplate restTemplate; // Il nostro telefono

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public void registerSale(Sale sale) {

        String inventoryUrl = "http://inventory-service:8081/api/inventory/"
                + sale.getProductId() + "/deduct?quantity=" + sale.getQuantity();

        try {
            restTemplate.put(inventoryUrl, null);
            System.out.println("✅ Magazzino avvisato della vendita.");
        } catch (Exception e) {
            throw new RuntimeException("Errore di comunicazione col Magazzino: " + e.getMessage());
        }

        saleRepository.save(sale);
    }
}