"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import InventoryShell from "../../components/inventory/InventoryShell";
import { inventoryNav } from "../../config/InventoryNav";

export default function InventoryLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <InventoryShell navItems={inventoryNav}>
                {children}
            </InventoryShell>
        </ProtectedRoute>
    );
}