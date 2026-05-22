"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Bell, Check, Clock, ShoppingCart, Trash2 } from "lucide-react";

type ProcurementNotification = {
    id: number;
    targetRole: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
};

export default function NotifichePage() {
    const [notifications, setNotifications] = useState<ProcurementNotification[]>([]);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

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
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;
    const readCount = notifications.filter((n) => n.read).length;

    const filteredNotifications = useMemo(() => {
        if (filter === "unread") {
            return notifications.filter((n) => !n.read);
        }

        if (filter === "read") {
            return notifications.filter((n) => n.read);
        }

        return notifications;
    }, [notifications, filter]);

    async function markAsRead(id: number) {
        try {
            await fetch(`http://localhost:8083/notifications/${id}/read`, {
                method: "PATCH",
            });

            await loadNotifications();

            window.dispatchEvent(
                new Event("procurement-notifications-updated")
            );
        } catch (error) {
            console.error("Errore aggiornamento notifica:", error);
        }
    }

    async function clearNotifications() {
        try {
            await fetch("http://localhost:8083/notifications/procurement", {
                method: "DELETE",
            });

            setNotifications([]);

            window.dispatchEvent(
                new Event("procurement-notifications-updated")
            );
        } catch (error) {
            console.error("Errore cancellazione notifiche:", error);
        }
    }

    function formatDate(value: string) {
        return new Intl.DateTimeFormat("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(value));
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Notifiche
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Tutte le notifiche procurement salvate nel database.
                    </p>
                </div>

                {notifications.length > 0 && (
                    <button
                        onClick={clearNotifications}
                        className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-xl font-semibold hover:bg-red-50 transition"
                    >
                        <Trash2 className="w-4 h-4" />
                        Svuota notifiche
                    </button>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-3 flex items-center gap-4">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-xl font-semibold ${
                        filter === "all"
                            ? "bg-red-50 text-red-600"
                            : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                    Tutte {notifications.length}
                </button>

                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-xl font-semibold ${
                        filter === "unread"
                            ? "bg-red-50 text-red-600"
                            : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                    Non lette {unreadCount}
                </button>

                <button
                    onClick={() => setFilter("read")}
                    className={`px-4 py-2 rounded-xl font-semibold ${
                        filter === "read"
                            ? "bg-green-50 text-green-600"
                            : "text-gray-500 hover:bg-gray-50"
                    }`}
                >
                    Lette {readCount}
                </button>
            </div>

            {filteredNotifications.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                    <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                        Nessuna notifica da mostrare.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`
                                bg-white border rounded-2xl p-5 flex items-center gap-5 shadow-sm transition
                                ${
                                notification.read
                                    ? "border-gray-200 opacity-75"
                                    : "border-red-100 border-l-4 border-l-red-500"
                            }
                            `}
                        >
                            <div
                                className={`
                                    w-14 h-14 rounded-full flex items-center justify-center shrink-0
                                    ${
                                    notification.read
                                        ? "bg-green-50 text-green-600"
                                        : "bg-red-50 text-red-600"
                                }
                                `}
                            >
                                {notification.read ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <ShoppingCart className="w-6 h-6" />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">
                                    {notification.title}
                                </h3>

                                <p className="text-gray-600 mt-1">
                                    {notification.message}
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {formatDate(notification.createdAt)}
                                </div>

                                {notification.read ? (
                                    <span className="flex items-center gap-2 text-green-600 font-semibold">
                                        <Check className="w-4 h-4" />
                                        Letta
                                    </span>
                                ) : (
                                    <button
                                        onClick={() =>
                                            markAsRead(notification.id)
                                        }
                                        className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        <Check className="w-4 h-4" />
                                        Segna come letta
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}