package com.taasselunga.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    //Riceve le richieste dal frontend e le instrada verso il microservizio corretto in base al path
    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                //Inoltra le richieste da /api/inventory/** a inventory-service
                .route("inventory-service", r -> r
                        .path("/api/inventory/**")
                        .uri("http://inventory-service:8081")
                )
                //Inoltra le richieste da /api/procurement/** a procurement-service
                .route("procurement-service", r -> r
                        .path("/api/procurement/**")
                        .uri("http://procurement-service:8082")
                )
                //Inoltra le richieste da /api/pos/** a point-of-sale-service
                .route("point-of-sale-service", r -> r
                        .path("/api/pos/**")
                        .uri("http://point-of-sale-service:8084")
                )
                //Inoltra le richieste da /api/notifications/** a notification-service
                .route("notification-service", r -> r
                        .path("/notifications/**")
                        .uri("http://notification-service:8083")
                )
                .build();
    }
}