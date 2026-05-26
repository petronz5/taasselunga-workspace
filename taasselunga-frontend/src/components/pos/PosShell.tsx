"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PosSidebar from "./PosSidebar";

type PosShellProps = {
    children: React.ReactNode;
    navItems: any[];
};

type PosNotification = {
    id: number;
    read: boolean;
};

export default function PosShell({ children, navItems }: PosShellProps) {
    const router = useRouter();
    const [alertsCount, setAlertsCount] = useState(0);

    useEffect(() => {
        loadUnreadNotifications();

        const interval = setInterval(() => {
            loadUnreadNotifications();
        }, 10000);

        window.addEventListener("pos-notifications-updated", loadUnreadNotifications);

        return () => {
            clearInterval(interval);
            window.removeEventListener("pos-notifications-updated", loadUnreadNotifications);
        };
    }, []);

    async function loadUnreadNotifications() {
        try {
            const response = await fetch("http://localhost:8080/notifications/pos");

            if (!response.ok) {
                setAlertsCount(0);
                return;
            }

            const data: PosNotification[] = await response.json();

            const unreadCount = Array.isArray(data)
                ? data.filter((notification) => !notification.read).length
                : 0;

            setAlertsCount(unreadCount);
        } catch (error) {
            console.error("Errore caricamento notifiche POS:", error);
            setAlertsCount(0);
        }
    }

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
                alertsCount={alertsCount}
                onLogout={handleLogout}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}