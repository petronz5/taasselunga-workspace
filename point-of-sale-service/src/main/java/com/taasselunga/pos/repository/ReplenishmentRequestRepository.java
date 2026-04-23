package com.taasselunga.pos.repository;

import com.taasselunga.pos.domain.ReplenishmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReplenishmentRequestRepository extends JpaRepository<ReplenishmentRequest, Long> {
    List<ReplenishmentRequest> findByStoreId(Long storeId);
}