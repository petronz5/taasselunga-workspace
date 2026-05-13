package com.taasselunga.pos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableMethodSecurity // Abilita @PreAuthorize sui controller/service
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http
                // Disabilita CSRF per API REST
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // Permette richieste preflight CORS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Endpoint monitoraggio applicazione
                        .requestMatchers("/actuator/**").permitAll()

                        // Endpoint POS protetti con JWT
                        .requestMatchers("/api/pos/**").authenticated()

                        // Tutto il resto richiede autenticazione
                        .anyRequest().authenticated()
                )

                // Configura Resource Server JWT con conversione ruoli Keycloak
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )

                .build();
    }

    // Converte i ruoli Keycloak in ruoli compatibili con Spring Security
    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {

        return jwt -> {

            // Keycloak salva i ruoli nel claim "realm_access.roles"
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");

            Collection<String> roles = realmAccess == null
                    ? List.of()
                    : (Collection<String>) realmAccess.get("roles");

            // Spring Security richiede il prefisso ROLE_
            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                    .collect(Collectors.toList());

            return new JwtAuthenticationToken(jwt, authorities);
        };
    }
}