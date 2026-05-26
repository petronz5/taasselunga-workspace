import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    ClipboardList,
    Bell,
} from "lucide-react";

export const posNav = [
    {
        name: "Dashboard",
        href: "/pos",
        icon: LayoutDashboard,
    },
    {
        name: "Prodotti",
        href: "/pos/products",
        icon: Package,
    },
    {
        name: "Sale",
        href: "/pos/sales",
        icon: ShoppingCart,
    },
    {
        name: "Richieste di Rifornimento",
        href: "/pos/replenishment",
        icon: ClipboardList,
    },
    {
        name: "Notifiche",
        href: "/pos/notifiche",
        icon: Bell,
    },
];