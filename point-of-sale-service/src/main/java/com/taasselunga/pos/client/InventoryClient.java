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

    private final RestTemplate restTemplate; //Comunicazione sincrona con rest

    @Value("${inventory.service.url}")
    private String inventoryServiceUrl; //URL base di Inventory Service

    //Recupera prodotti e relative giacenze dal magazzino tramite REST
    public Object getProductsWithStock(String token) {
        //mod per paginator!
        String url = inventoryServiceUrl + "/api/inventory/products?page=0&size=50";

        //Inserisce il token JWT nell'header della richiesta
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders(token));

        //Chiamata REST - metodo GET verso Inventory Service
        ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.GET, entity, Object.class);

        return response.getBody();
    }

    //Scala giacenza di un prodotto nel magazzino centrale tramite REST
    public void deductStock(Long productId, Integer quantity, String token) {
        String url = inventoryServiceUrl + "/api/inventory/" + productId + "/deduct?quantity=" + quantity;

        //Inserisce il token JWT nell'header della richiesta
        HttpEntity<Void> entity = new HttpEntity<>(createAuthHeaders(token));

        //Chiamata REST - metodo PUT verso Inventory Service
        restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
    }

    //Invia richiesta di rifornimento a Inventory tramite REST
    public void sendReplenishmentRequest(Long storeId, Long productId, Integer quantity, String token) {
        String url = inventoryServiceUrl + "/api/inventory/replenishment";

        ReplenishmentRequestDto dto = new ReplenishmentRequestDto(productId, quantity, storeId);

        //Inserisce dati e token JWT nell'header della richesta
        HttpEntity<ReplenishmentRequestDto> entity = new HttpEntity<>(dto, createAuthHeaders(token));

        //Chiamata REST - metodoPOST verso Inventory
        restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }

    // Crea header autenticaz. contenenti il token JWT
    private HttpHeaders createAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        return headers;
    }
}