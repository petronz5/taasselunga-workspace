package com.taasselunga.procurement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class OrderLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lineId;

    private Long productId;
    private Integer quantity;

    public OrderLine(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public void changeQuantity(Integer newQty) {
        this.quantity = newQty;
    }
}