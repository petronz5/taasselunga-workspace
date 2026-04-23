package com.taasselunga.procurement.service;

import com.taasselunga.procurement.domain.PurchaseOrder;
import com.taasselunga.procurement.repository.PurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcurementService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }

    public void addOrder(PurchaseOrder order) {
        order.setOrderDate(LocalDate.now());
        purchaseOrderRepository.save(order);
    }
}