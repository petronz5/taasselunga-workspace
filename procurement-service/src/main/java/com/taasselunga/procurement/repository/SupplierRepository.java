package com.taasselunga.procurement.repository;

import com.taasselunga.procurement.domain.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
}