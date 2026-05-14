package com.taasselunga.pos.client;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
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
    public void deductStock(Long productId, Integer quantity, String token) {
        String url = inventoryServiceUrl +
                "/api/inventory/" + productId +
                "/deduct?quantity=" + quantity;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
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

    public java.util.List<?> getProductsWithStock(String token) {
        String url = inventoryServiceUrl + "/api/inventory/products";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<java.util.List> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, java.util.List.class);

        return response.getBody();
    }
}