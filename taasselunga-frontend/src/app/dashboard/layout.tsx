"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { io } from 'socket.io-client';
import '../globals.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [alerts, setAlerts] = useState<string[]>([]);
    const pathname = usePathname();

    useEffect(() => {
        const socket = io('http://localhost:8083');

        socket.on('stock_alert', (message) => {
            setAlerts((prev) => [message, ...prev]);

            setTimeout(() => {
                setAlerts((prev) => prev.filter(n => n !== message));
            }, 8000);
        });

        return () => { socket.disconnect(); };
    }, []);

    const isActive = (path: string) => pathname === path;

    return (
        <html lang="it">
        <body>
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans relative">

            <div className="md:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center z-30 sticky top-0">
                <div className="flex items-baseline gap-1">
                    <h1 className="text-xl font-extrabold text-blue-900 tracking-wider">TAASSELUNGA</h1>
                    <span className="text-2xl text-red-600 font-black italic">T</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 bg-gray-100 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                    </svg>
                </button>
            </div>

            <aside className={`
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                        md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 p-6 flex flex-col transition-transform duration-300 z-20 shadow-xl md:shadow-none
                    `}>
                <div className="hidden md:flex flex-col items-center mb-8 pb-4 border-b border-gray-100">
                    <h1 className="text-2xl font-extrabold text-blue-900 tracking-wider">TAASSELUNGA</h1>
                    <div className="text-4xl text-red-600 font-black italic mt-1">T</div>
                </div>

                <nav className="flex-1 space-y-2 mt-4 md:mt-0">
                    <Link href="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'}`}>
                        🏠 Dashboard
                    </Link>
                    <Link href="/dashboard/products" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/products') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'}`}>
                        📦 Prodotti
                    </Link>
                    <Link href="/dashboard/orders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/orders') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'}`}>
                        🛒 Ordini
                    </Link>
                    <Link href="/dashboard/suppliers" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/suppliers') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'}`}>
                        🤝 Fornitori
                    </Link>
                    <Link href="/dashboard/pos" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/dashboard/pos') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900'}`}>
                        💶 Casse POS
                    </Link>

                    <div className="flex justify-between items-center px-4 py-3 text-gray-600 font-medium mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">🔔 Notifiche</div>
                        {alerts.length > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">{alerts.length}</span>
                        )}
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">AL</div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm text-gray-900 truncate">Alessia</p>
                            <p className="text-xs text-gray-500 truncate">Approvvigionamento</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative">

                <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
                    {alerts.map((msg, idx) => (
                        <div key={idx} className="bg-red-600/90 backdrop-blur-md text-white p-5 rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex items-center gap-4 animate-bounce border border-red-400">
                            <span className="text-4xl">🚨</span>
                            <div>
                                <h4 className="font-black text-xl mb-1 drop-shadow-md">ALLARME SCORTE</h4>
                                <div className="font-bold text-sm text-red-100">{msg}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {children}
            </main>

        </div>
        </body>
        </html>
    );
}