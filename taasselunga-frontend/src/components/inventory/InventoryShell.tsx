"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import InventorySidebar from "./InventorySidebar";

export type InventoryNotification = {
    id: number;
    targetRole: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
};

type InventoryShellProps = {
    children: React.ReactNode;
    navItems: any[];
};

export default function InventoryShell({
                                           children,
                                           navItems,
                                       }: InventoryShellProps) {
    const [notifications, setNotifications] = useState<InventoryNotification[]>([]);
    const router = useRouter();

    async function loadNotifications() {
        try {
            const response = await fetch(
                "http://localhost:8080/notifications/inventory"
            );

            if (!response.ok) {
                setNotifications([]);
                return;
            }

            const text = await response.text();
            const data = text ? JSON.parse(text) : [];

            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Errore caricamento notifiche inventory:", error);
            setNotifications([]);
        }
    }

    useEffect(() => {
        loadNotifications();

        window.addEventListener(
            "inventory-notifications-updated",
            loadNotifications
        );

        return () => {
            window.removeEventListener(
                "inventory-notifications-updated",
                loadNotifications
            );
        };
    }, []);

    useEffect(() => {
        const socket = io("http://localhost:8083");

        socket.on("stock_alert", (notification: InventoryNotification) => {
            if (notification.targetRole !== "INVENTORY") {
                return;
            }

            setNotifications((prev) => [notification, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_name");

        router.push("/");
    }

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <InventorySidebar
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