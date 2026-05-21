"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { dashboardNav } from "../../config/DashboardNav";

type SidebarProps = {
    isSidebarOpen: boolean;
    alertsCount: number;
    onLogout: () => void;
};

export default function Sidebar({
                                    isSidebarOpen,
                                    alertsCount,
                                    onLogout,
                                }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        fixed md:static inset-y-0 left-0
        w-64 bg-white border-r border-gray-200
        p-6 flex flex-col
        transition-transform duration-300
        z-20 shadow-xl md:shadow-none
      `}
        >
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
                flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${
                                isActive
                                    ? "bg-blue-50 text-blue-700 font-bold"
                                    : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                            }
              `}
                        >
                            <Icon className="w-5 h-5" />

                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                <div className="flex justify-between items-center px-4 py-3 text-gray-600 font-medium mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5" />
                        <span>Notifiche</span>
                    </div>

                    {alertsCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
              {alertsCount}
            </span>
                    )}
                </div>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold">
                        AL
                    </div>

                    <div className="overflow-hidden">
                        <p className="font-bold text-sm text-gray-900 truncate">
                            Alessia
                        </p>

                        <p className="text-xs text-gray-500 truncate">
                            Approvvigionamento
                        </p>
                    </div>
                </div>

                <button
                    onClick={onLogout}
                    className="w-full mt-4 bg-red-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}