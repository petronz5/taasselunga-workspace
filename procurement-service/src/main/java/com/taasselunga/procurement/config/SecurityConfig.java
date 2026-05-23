package com.taasselunga.procurement.config;

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

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/api/procurement/**").authenticated()
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .build();
    }

    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        return jwt -> {
            String email = jwt.getClaimAsString("email");
            List<SimpleGrantedAuthority> authorities = getAuthorities(email);
            return new JwtAuthenticationToken(jwt, authorities);
        };
    }

    private List<SimpleGrantedAuthority> getAuthorities(String email) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        if ("alessia@taasselunga.it".equalsIgnoreCase(email)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_RESPONSABILE_APPROVVIGIONAMENTO"));
        }

        if ("antonio@taasselunga.it".equalsIgnoreCase(email)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_OPERATORE_DI_MAGAZZINO"));
        }

        if ("luigi@taasselunga.it".equalsIgnoreCase(email)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_RESPONSABILE_PUNTO_VENDITA"));
        }

        return authorities;
    }
}