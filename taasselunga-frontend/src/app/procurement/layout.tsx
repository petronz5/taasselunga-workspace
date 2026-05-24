"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import ProcurementShell from "../../components/procurement/ProcurementShell";
import { procurementNav } from "../../config/ProcurementNav";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <ProcurementShell navItems={procurementNav}>
                {children}
            </ProcurementShell>
        </ProtectedRoute>
    );
}