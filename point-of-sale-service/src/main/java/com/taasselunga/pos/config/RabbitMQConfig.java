package com.taasselunga.pos.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    //Unico Exchange
    public static final String EXCHANGE_NAME = "taasselunga-exchange";

    //Unica routing key per Inventory
    public static final String POS_ROUTING_KEY = "pos";
    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }
}