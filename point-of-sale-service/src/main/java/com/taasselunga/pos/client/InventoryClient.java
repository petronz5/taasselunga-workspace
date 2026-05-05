package com.taasselunga.pos.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class InventoryClient {

    private final RestTemplate restTemplate;

    @Value("${inventory.service.url}")
    private String inventoryServiceUrl;

    // Scala lo stock
    public void deductStock(Long productId, Integer quantity) {
        String url = inventoryServiceUrl +
                "/api/inventory/" + productId +
                "/deduct?quantity=" + quantity;

        restTemplate.put(url, null);
    }

    // Registra merce ricevuta
    public void receiveGoods(Long productId, Integer quantity) {
        String url = inventoryServiceUrl
                + "/api/inventory/receive?productId="
                + productId
                + "&quantity="
                + quantity;

        restTemplate.postForObject(url, null, String.class);
    }

    public java.util.List<?> getProductsWithStock() {
        String url = inventoryServiceUrl + "/api/inventory/products";
        return restTemplate.getForObject(url, java.util.List.class);
    }
}