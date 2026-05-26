package com.taasselunga.pos.client;

import com.taasselunga.pos.dto.ReplenishmentRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class InventoryClient {

    private final RestTemplate restTemplate;

    @Value("${inventory.service.url}")
    private String inventoryServiceUrl;

    public Object getProductsWithStock(String token) {
        String url = inventoryServiceUrl + "/api/inventory/products?page=0&size=50";

        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders(token));

        ResponseEntity<Object> response =
                restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);

        return response.getBody();
    }

    public void deductStock(Long productId, Integer quantity, String token) {
        String url = inventoryServiceUrl
                + "/api/inventory/"
                + productId
                + "/deduct?quantity="
                + quantity;

        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders(token));

        restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
    }

    public void sendReplenishmentRequest(
            Long storeId,
            Long productId,
            Integer quantity,
            String token
    ) {
        String url = inventoryServiceUrl + "/api/inventory/replenishment";

        ReplenishmentRequestDto dto = new ReplenishmentRequestDto(
                productId,
                quantity,
                storeId
        );

        HttpEntity<ReplenishmentRequestDto> entity =
                new HttpEntity<>(dto, createAuthHeaders(token));

        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }

    private HttpHeaders createAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        return headers;
    }
}