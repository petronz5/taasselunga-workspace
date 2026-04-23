package com.taasselunga.inventory.dto;

public record ProductResponseDTO(
        Long id,
        String name,
        String category,
        Integer stockQuantity,
        Integer reorderThreshold,
        Double price,
        String imageUrl
) {}