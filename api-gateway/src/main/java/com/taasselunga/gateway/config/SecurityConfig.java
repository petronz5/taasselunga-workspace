package com.taasselunga.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain; // Questo import risolve l'errore
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {

        return http
                // Permette al frontend React di chiamare il gateway
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disabilita CSRF per API REST
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                .authorizeExchange(exchanges -> exchanges
                        // Permette le richieste OPTIONS preflight dei browser
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()

                        // Endpoint tecnici liberi
                        .pathMatchers("/actuator/**").permitAll()

                        // Permette le rotte delle notifiche (se gestite o deviate dal gateway)
                        .pathMatchers("/notifications/**").permitAll()

                        // Tutte le API richiedono login/token
                        .pathMatchers("/api/**").authenticated()

                        // Qualsiasi altra richiesta richiede autenticazione
                        .anyExchange().authenticated()
                )

                // Il gateway controlla i token JWT di Keycloak
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> {})
                )

                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Frontend autorizzato esplicitamente
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Metodi HTTP elencati esplicitamente (fondamentale con allowCredentials attivo)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Header principali richiesti dal frontend e da Keycloak elencati esplicitamente
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));

        // Permette l'invio di credenziali, cookie e token Bearer
        configuration.setAllowCredentials(true);

        // Tempo di cache per le risposte OPTIONS (preflight) clementi per il browser
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        // Applica la configurazione a tutte le rotte del Gateway
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}