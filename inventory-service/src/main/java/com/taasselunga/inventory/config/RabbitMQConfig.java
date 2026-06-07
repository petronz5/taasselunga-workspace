package com.taasselunga.inventory.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    //Unico Exchange
    public static final String EXCHANGE_NAME = "taasselunga-exchange";

    //Prima routing key per Inventory
    public static final String LOW_STOCK_ROUTING_KEY = "stock.low";

    //Seconda routing key per Inventory
    public static final String PROCUREMENT_ROUTING_KEY = "procurement.notification";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }
}