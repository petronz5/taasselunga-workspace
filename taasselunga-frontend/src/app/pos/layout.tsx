"use client";

import React from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import PosShell from "../../components/pos/PosShell";
import { posNav } from "../../config/PosNav";

export default function PosLayout({
                                      children,
                                  }: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <PosShell navItems={posNav}>
                {children}
            </PosShell>
        </ProtectedRoute>
    );
}