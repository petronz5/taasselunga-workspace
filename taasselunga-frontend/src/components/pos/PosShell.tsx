"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PosSidebar from "./PosSidebar";

type PosShellProps = {
    children: React.ReactNode;
    navItems: any[];
};

export default function PosShell({ children, navItems }: PosShellProps) {
    const router = useRouter();

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_name");

        router.push("/");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <PosSidebar
                items={navItems}
                alertsCount={0}
                onLogout={handleLogout}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}