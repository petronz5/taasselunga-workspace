package com.taasselunga.procurement.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String contact;
    private String email;
    private String phone;
    private Integer reliability; // Percentuale di affidabilità (es. 98)

    public Supplier(String name, String contact, String email, String phone, Integer reliability) {
        this.name = name;
        this.contact = contact;
        this.email = email;
        this.phone = phone;
        this.reliability = reliability;
    }
}