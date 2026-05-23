"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import Sidebar from "./Sidebar";

export type ProcurementNotification = {
    id: number;
    targetRole: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
};

type DashboardShellProps = {
    children: React.ReactNode;
    navItems: any[];
};

export default function DashboardShell({
                                           children,
                                           navItems,
                                       }: DashboardShellProps) {
    const [notifications, setNotifications] = useState<ProcurementNotification[]>([]);
    const router = useRouter();

    async function loadNotifications() {
        try {
            const response = await fetch(
                "http://localhost:8083/notifications/procurement"
            );

            const data = await response.json();

            setNotifications(data);
        } catch (error) {
            console.error("Errore caricamento notifiche:", error);
        }
    }

    useEffect(() => {
        loadNotifications();

        window.addEventListener(
            "procurement-notifications-updated",
            loadNotifications
        );

        return () => {
            window.removeEventListener(
                "procurement-notifications-updated",
                loadNotifications
            );
        };
    }, []);

    useEffect(() => {
        const socket = io("http://localhost:8083");

        socket.on("stock_alert", (notification: ProcurementNotification) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/");
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <Sidebar
                items={navItems}
                alertsCount={unreadCount}
                onLogout={handleLogout}
            />

            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}