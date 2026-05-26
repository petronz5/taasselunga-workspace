package com.taasselunga.pos.dto;

public record ReplenishmentRequestDto(
        Long productId,
        Integer quantity,
        Long storeId
) {}