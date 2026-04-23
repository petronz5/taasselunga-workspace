package com.taasselunga.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                // 1. Applica le regole CORS definite in basso
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. Disabilita CSRF per permettere chiamate da localhost:3000
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        // 3. IMPORTANTISSIMO: Lascia sempre passare le chiamate preflight del browser (OPTIONS)
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        // 4. Sblocca completamente le rotte API per permettere al frontend di testare i dati senza login
                        .pathMatchers("/api/**").permitAll()
                        // 5. Tutte le altre pagine (es. la radice per il login) richiedono l'autenticazione
                        .anyExchange().authenticated()
                )
                // 6. Configurazione del Login Google (reindirizza alla dashboard in caso di successo)
                .oauth2Login(oauth2 -> oauth2
                        .authenticationSuccessHandler(
                                new org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler("http://localhost:3000/dashboard")
                        )
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permetti SOLO al tuo frontend di connettersi
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        // Permetti tutti i metodi (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(List.of("*"));
        // Permetti tutti gli header
        configuration.setAllowedHeaders(List.of("*"));
        // Permetti l'invio di cookie/credenziali
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Applica queste regole a tutti gli endpoint del gateway (/**)
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}