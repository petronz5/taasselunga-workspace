package com.taasselunga.inventory.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long stockId;

    private Long productId;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "available_quantity"))
    })
    private Quantity availableQuantity;

    @Embedded
    private StockThreshold threshold;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "stock_id")
    private List<StockMovement> movements = new ArrayList<>();

    public Stock(Long productId, Quantity initialQuantity, StockThreshold threshold) {
        this.productId = productId;
        this.availableQuantity = initialQuantity;
        this.threshold = threshold;
    }

    public void increase(Quantity qty) {
        this.availableQuantity = this.availableQuantity.add(qty);
        this.movements.add(new StockMovement("IN", qty));
    }

    public void decrease(Quantity qty) {
        this.availableQuantity = this.availableQuantity.subtract(qty);
        this.movements.add(new StockMovement("OUT", qty));
    }

    public boolean isBelowThreshold() {
        return this.threshold.isBreached(this.availableQuantity);
    }
}