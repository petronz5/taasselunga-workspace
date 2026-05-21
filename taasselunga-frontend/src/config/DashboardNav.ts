import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Handshake,
    CreditCard,
} from "lucide-react";

export const dashboardNav = [
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
        name: "Fornitori",
        href: "/procurement/suppliers",
        icon: Handshake,
    },
    {
        name: "Casse POS",
        href: "/procurement/pos",
        icon: CreditCard,
    },
];