package com.taasselunga.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("inventory-service", r -> r
                        .path("/api/inventory/**")
                        .uri("http://inventory-service:8081")
                )
                .route("procurement-service", r -> r
                        .path("/api/procurement/**")
                        .uri("http://procurement-service:8082")
                )
                .route("point-of-sale-service", r -> r
                        .path("/api/pos/**")
                        .uri("http://point-of-sale-service:8084")
                )
                .route("notification-service", r -> r
                        .path("/notifications/**")
                        .uri("http://notification-service:8083")
                )
                .build();
    }
}