package com.taasselunga.inventory.config;

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
                .csrf(csrf -> csrf.disable()) //Il servizio espone API REST, disabil CSRF
                .cors(cors -> cors.disable()) //Disabilita CORS perché viene gestito dal Gateway

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()

                        //Richiede autenticazione proteggendo gli endpoint Inventory
                        .requestMatchers("/api/inventory/**").authenticated()

                        //Protegge tutti gli altri endpoint con l'autenticaz.
                        .anyRequest().authenticated()
                )
                //Autenticazione tramite JWT
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                )
                .build();
    }

    //Converte token JWT in utente autenticato (ruoli associati tramite mail)
    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        return jwt -> {
            String email = jwt.getClaimAsString("email");
            List<SimpleGrantedAuthority> authorities = getAuthorities(email);
            return new JwtAuthenticationToken(jwt, authorities);
        };
    }

    //Associa i ruoli in base alla mail
    private List<SimpleGrantedAuthority> getAuthorities(String email) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        //Alessia = respons. approv. (PW: alessia)
        if ("alessia@taasselunga.it".equalsIgnoreCase(email)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_RESPONSABILE_APPROVVIGIONAMENTO"));
        }

        //Antonio = operat. magaz. (PW: antonio) ----> ACCESSO CON MIO FACEBOOK E MIA MAIL
        if ("antonio@taasselunga.it".equalsIgnoreCase(email) || "luca.disalvo01@gmail.com".equalsIgnoreCase(email) || "luca.disalvo40@edu.unito.it".equalsIgnoreCase(email) || "luca.disalvo40@unito.it".equalsIgnoreCase(email)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_OPERATORE_DI_MAGAZZINO"));
        }

        //Luigi = resp. punto vendita (PW: luigi1)
        if ("luigi@taasselunga.it".equalsIgnoreCase(email)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_RESPONSABILE_PUNTO_VENDITA"));
        }

        return authorities;
    }
}