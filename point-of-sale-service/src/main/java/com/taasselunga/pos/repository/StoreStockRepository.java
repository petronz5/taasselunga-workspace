package com.taasselunga.pos.repository;

import com.taasselunga.pos.domain.StoreStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreStockRepository extends JpaRepository<StoreStock, Long> {

    List<StoreStock> findByStoreId(Long storeId);

    Optional<StoreStock> findByStoreIdAndProductId(Long storeId, Long productId);
}