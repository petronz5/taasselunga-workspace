"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { dashboardNav } from "../../config/DashboardNav";

type SidebarProps = {
    alertsCount: number;
    onLogout: () => void;
};

export default function Sidebar({ alertsCount, onLogout }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col min-h-screen">
            <div className="flex flex-col items-center mb-8 pb-4 border-b border-gray-100">
                <img
                    src="/logo-taasselunga.png"
                    alt="Taasselunga"
                    className="w-[200px] h-auto object-contain"
                />
            </div>

            <nav className="flex-1 space-y-2">
                {dashboardNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex items-center justify-between px-4 py-3 rounded-xl transition
                                ${
                                isActive
                                    ? "bg-blue-50 text-blue-700 font-bold"
                                    : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                            }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </div>

                            {item.href === "/procurement/notifiche" && alertsCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {alertsCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">
                        AL
                    </div>

                    <div>
                        <p className="font-bold text-sm text-gray-900">Alessia</p>
                        <p className="text-xs text-gray-500">Approvvigionamento</p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full mt-4 border border-red-200 text-red-600 py-2 rounded-xl text-sm font-bold hover:bg-red-50 transition"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}