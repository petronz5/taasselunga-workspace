"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import ProcurementShell from "../../components/procurement/ProcurementShell";
import { inventoryNav } from "../../config/InventoryNav";

export default function InventoryLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <ProcurementShell navItems={inventoryNav}>
                {children}
            </ProcurementShell>
        </ProtectedRoute>
    );
}