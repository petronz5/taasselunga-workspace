package com.taasselunga.inventory.dto;

public record ReplenishmentRequestDto(
        Long productId,
        Integer quantity,
        Long storeId
) {}