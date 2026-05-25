"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

type SidebarItem = {
    name: string;
    href: string;
    icon: any;
};

type PosSidebarProps = {
    items: SidebarItem[];
    alertsCount: number;
    onLogout: () => void;
};

export default function PosSidebar({
                                       items,
                                       alertsCount,
                                       onLogout,
                                   }: PosSidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-72 min-h-screen bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-100">
                <img
                    src="/logo-taasselunga.png"
                    alt="Taasselunga"
                    className="w-44 h-auto object-contain"
                />

                <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-wide">
                    Area Punto Vendita
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/pos" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                relative flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition
                                ${
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }
                            `}
                        >
                            <Icon className="w-5 h-5" />

                            <span>{item.name}</span>

                            {item.href.includes("notifiche") &&
                                alertsCount > 0 && (
                                    <span className="ml-auto min-w-6 h-6 px-2 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center">
                                        {alertsCount}
                                    </span>
                                )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    );
}