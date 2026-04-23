package com.taasselunga.pos.repository;

import com.taasselunga.pos.domain.Sale;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SaleRepository extends JpaRepository<Sale, Long> {
}