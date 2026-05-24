import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Bell,
} from "lucide-react";

export const procurementNav = [
    {
        name: "Dashboard",
        href: "/procurement",
        icon: LayoutDashboard,
    },
    {
        name: "Prodotti",
        href: "/procurement/products",
        icon: Package,
    },
    {
        name: "Ordini",
        href: "/procurement/orders",
        icon: ShoppingCart,
    },
    {
        name: "Notifiche",
        href: "/procurement/notifiche",
        icon: Bell,
    },
];