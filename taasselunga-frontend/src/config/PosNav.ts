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
        name: "Product Catalog",
        href: "/pos/products",
        icon: Package,
    },
    {
        name: "New Sale",
        href: "/pos/sales",
        icon: ShoppingCart,
    },
    {
        name: "Replenishments",
        href: "/pos/replenishment",
        icon: ClipboardList,
    },
    {
        name: "Notifications",
        href: "/pos/notifications",
        icon: Bell,
    },
];