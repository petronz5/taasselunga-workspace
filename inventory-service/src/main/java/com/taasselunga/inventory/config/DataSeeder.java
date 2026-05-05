package com.taasselunga.inventory.config;

import com.taasselunga.inventory.domain.Quantity;
import com.taasselunga.inventory.domain.Stock;
import com.taasselunga.inventory.domain.StockThreshold;
import com.taasselunga.inventory.repository.StockRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(StockRepository repository) {
        return args -> {
            // Se il database è vuoto, inseriamo i dati di test
            if (repository.count() == 0) {

                Stock stockLatte = new Stock(1L, new Quantity(135), new StockThreshold(200));

                Stock stockUova = new Stock(2L, new Quantity(152), new StockThreshold(200));

                repository.save(stockLatte);
                repository.save(stockUova);

                System.out.println("Dati fittizi inseriti nel database: Latte Parmalat e Uova AIA pronti nel magazzino!");
            }
        };
    }
}