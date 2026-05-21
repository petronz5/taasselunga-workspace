"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import Sidebar from "./Sidebar";

export default function DashboardShell({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const socket = io("http://localhost:8083");

        socket.on("stock_alert", (message: string) => {
            setAlerts((prev) => [message, ...prev]);

            setTimeout(() => {
                setAlerts((prev) => prev.filter((n) => n !== message));
            }, 8000);
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">
            <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-30 sticky top-0">
                <img
                    src="/logo-taasselunga.png"
                    alt="Taasselunga"
                    className="w-[180px] h-auto object-contain"
                />

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-600 bg-gray-100 rounded-lg"
                >
                    {isSidebarOpen ? "✕" : "☰"}
                </button>
            </div>

            <Sidebar
                isSidebarOpen={isSidebarOpen}
                alertsCount={alerts.length}
                onLogout={handleLogout}
            />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative">
                <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
                    {alerts.map((msg, idx) => (
                        <div
                            key={idx}
                            className="bg-red-600/90 backdrop-blur-md text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex items-center gap-4 animate-bounce border border-red-400"
                        >
                            <span className="text-4xl">🚨</span>

                            <div>
                                <h4 className="font-black text-xl mb-1 drop-shadow-md">
                                    ALLARME SCORTE
                                </h4>
                                <div className="font-bold text-sm text-red-100">{msg}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {children}
            </main>
        </div>
    );
}