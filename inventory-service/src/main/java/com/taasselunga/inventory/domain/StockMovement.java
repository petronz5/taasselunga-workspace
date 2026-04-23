package com.taasselunga.inventory.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long movementId;

    private String type;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "movement_quantity"))
    })
    private Quantity quantity;

    private LocalDateTime timestamp;

    public StockMovement(String type, Quantity quantity) {
        this.type = type;
        this.quantity = quantity;
        this.timestamp = LocalDateTime.now();
    }
}