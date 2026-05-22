package com.taasselunga.inventory.dto;

public record ProductRequestDTO(
        String name,
        String category,
        Double price,
        String imageUrl,
        String barcode,
        Integer initialStock,
        Integer threshold
) {}