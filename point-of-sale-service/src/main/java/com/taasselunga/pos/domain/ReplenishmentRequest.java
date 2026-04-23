package com.taasselunga.pos.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class ReplenishmentRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private Long storeId;
    private Long productId;
    private Integer requestedQuantity;

    @Embedded
    private RequestStatus status;

    private LocalDateTime requestDate;

    public ReplenishmentRequest(Long storeId, Long productId, Integer requestedQuantity) {
        this.storeId = storeId;
        this.productId = productId;
        this.requestedQuantity = requestedQuantity;
        this.status = new RequestStatus("INVIATA");
        this.requestDate = LocalDateTime.now();
    }

    public void markAsDelivered() {
        this.status = new RequestStatus("CONSEGNATA");
    }
}