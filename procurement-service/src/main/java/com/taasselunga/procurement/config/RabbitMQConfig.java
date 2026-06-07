package com.taasselunga.procurement.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    //Unico Exchange
    public static final String EXCHANGE_NAME = "taasselunga-exchange";

    //Coda per prodotto sotto soglia
    public static final String PROCUREMENT_QUEUE = "low-stock-queue";

    //Prima routing key associata a Procurement (prodotto sotto soglia)
    public static final String ROUTING_KEY = "stock.low";

    //Seconda routing key associata a Procurement (ordine approvvig. creato)
    public static final String PURCHASE_ORDER_ROUTING_KEY = "purchase.order.created";

    @Bean
    public Queue queue() {
        return new Queue(PROCUREMENT_QUEUE, true);
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