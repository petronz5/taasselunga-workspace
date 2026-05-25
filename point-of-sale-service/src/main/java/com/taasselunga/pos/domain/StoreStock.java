package com.taasselunga.pos.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class StoreStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stockId;

    private Long storeId;

    private Long productId;

    private Integer availableQuantity;

    private Integer minimumLevel;

    public StoreStock(
            Long storeId,
            Long productId,
            Integer availableQuantity,
            Integer minimumLevel
    ) {
        this.storeId = storeId;
        this.productId = productId;
        this.availableQuantity = availableQuantity;
        this.minimumLevel = minimumLevel;
    }
}