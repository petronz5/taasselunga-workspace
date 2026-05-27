package com.taasselunga.inventory.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;

    private Double price;

    @Basic(fetch = FetchType.LAZY)
    @Column(name = "image", columnDefinition = "BYTEA")
    private byte[] image; //per foto in dataabse

    @Column(unique = true)
    private String barcode;

    public Product(
            String name,
            String category,
            Double price,
            byte[] image,
            String barcode
    ) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.image = image;
        this.barcode = barcode;
    }
}