"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import DashboardShell from "../../components/dashboard/DashboardShell";
import { inventoryNav } from "../../config/InventoryNav";

export default function InventoryLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <DashboardShell navItems={inventoryNav}>
                {children}
            </DashboardShell>
        </ProtectedRoute>
    );
}