package com.taasselunga.inventory.domain;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Quantity {
    private Integer value;

    public Quantity add (Quantity q){
        return new Quantity(this.value + q.getValue());
    }

    public Quantity subtract(Quantity q){
        if(this.value - q.getValue() <0 ){
            throw new IllegalArgumentException("La quantità non può essere negativa");
        }
        return new Quantity(this.value - q.getValue());
    }
}
