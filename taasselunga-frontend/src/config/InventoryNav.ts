import {
    LayoutDashboard,
    Package,
    Truck,
    Store,
    ArrowLeftRight,
    Bell,
    ScanBarcode,
} from "lucide-react";
export const inventoryNav = [
    {
        name: "Dashboard",
        href: "/inventory",
        icon: LayoutDashboard,
    },
    {
        name: "Giacenze",
        href: "/inventory/products",
        icon: Package,
    },
    {
        name: "Ricezione merce",
        href: "/inventory/receive",
        icon: Truck,
    },
    {
        name: "Scanner barcode",
        href: "/inventory/scanner",
        icon: ScanBarcode,
    },
    {
        name: "Richieste POS",
        href: "/inventory/pos-requests",
        icon: Store,
    },
    {
        name: "Movimenti",
        href: "/inventory/movements",
        icon: ArrowLeftRight,
    },
    {
        name: "Notifiche",
        href: "/inventory/notifiche",
        icon: Bell,
    },
];