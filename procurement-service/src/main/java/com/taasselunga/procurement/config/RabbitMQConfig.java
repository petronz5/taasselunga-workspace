package com.taasselunga.procurement.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PROCUREMENT_QUEUE  = "low-stock-queue";
    public static final String EXCHANGE_NAME = "taasselunga-exchange";
    public static final String ROUTING_KEY = "stock.low";

    @Bean
    public Queue queue() {
        return new Queue(PROCUREMENT_QUEUE , true);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }
}