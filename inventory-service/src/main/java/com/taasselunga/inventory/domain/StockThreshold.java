package com.taasselunga.inventory.domain;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StockThreshold {
    private Integer minimumLevel;

    public boolean isBreached(Quantity currentQty) {
        return currentQty.getValue() < this.minimumLevel;
    }
}