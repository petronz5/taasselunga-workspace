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
        name: "Catalogo prodotti",
        href: "/pos/products",
        icon: Package,
    },
    {
        name: "Nuova vendita",
        href: "/pos/sales",
        icon: ShoppingCart,
    },
    {
        name: "Richieste rifornimento",
        href: "/pos/replenishment",
        icon: ClipboardList,
    },
    {
        name: "Notifiche",
        href: "/pos/notifiche",
        icon: Bell,
    },
];