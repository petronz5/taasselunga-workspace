package com.taasselunga.inventory.dto;

public record ProductRequestDTO(
        String name,
        String category,
        Double price,
        String barcode,
        Integer initialStock,
        Integer threshold
) {}