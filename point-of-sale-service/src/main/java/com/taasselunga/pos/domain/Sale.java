    package com.taasselunga.pos.domain;

    import jakarta.persistence.*;
    import lombok.Getter;
    import lombok.NoArgsConstructor;
    import lombok.Setter;
    import java.time.LocalDateTime;

    @Entity
    @Getter
    @Setter
    @NoArgsConstructor
    public class Sale {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        private Double totalAmount;
        private LocalDateTime saleDate;
        private String cashierName;
        private Long productId;
        private Integer quantity;

        public Sale(Double totalAmount, String cashierName, Long productId, Integer quantity) {
            this.totalAmount = totalAmount;
            this.cashierName = cashierName;
            this.productId = productId;
            this.quantity = quantity;
            this.saleDate = LocalDateTime.now();
        }
    }