package com.taasselunga.procurement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber;
    private LocalDateTime orderDate;
    private String supplierName;
    private Double totalAmount;
    private String status;

    // Dati del prodotto ordinato
    private Long productId;
    private String productName;
    private Integer quantity;
    private Double unitPrice;

    public PurchaseOrder(
            String orderNumber,
            String supplierName,
            Double totalAmount,
            String status
    ) {
        this.orderNumber = orderNumber;
        this.orderDate = LocalDateTime.now();
        this.supplierName = supplierName;
        this.totalAmount = totalAmount;
        this.status = status;
    }
}