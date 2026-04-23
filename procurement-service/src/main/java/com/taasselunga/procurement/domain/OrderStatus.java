package com.taasselunga.procurement.domain;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatus {
    private String statusName;

    public boolean isPending() {
        return "BOZZA".equalsIgnoreCase(this.statusName);
    }

    public boolean isCompleted() {
        return "COMPLETATO".equalsIgnoreCase(this.statusName);
    }
}