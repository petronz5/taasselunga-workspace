package com.taasselunga.procurement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class PurchaseOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber;
    private LocalDate orderDate;
    private String supplierName;
    private Double totalAmount;
    private String status;

    public PurchaseOrder(String orderNumber, String supplierName, Double totalAmount, String status) {
        this.orderNumber = orderNumber;
        this.orderDate = LocalDate.now();
        this.supplierName = supplierName;
        this.totalAmount = totalAmount;
        this.status = status;
    }
}