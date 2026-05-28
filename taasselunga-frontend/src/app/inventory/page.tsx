"use client";

import AlertModal from "../../components/AlertModal";
import React, { useEffect, useMemo, useState } from "react";
import {
    ClipboardCheck,
    Package,
    Truck,
    Send,
} from "lucide-react";

interface Product {
    id: number;
    name: string;
    category: string;
    stockQuantity: number;
    reorderThreshold: number;
    price: number;
    imageBase64?: string;
    barcode?: string;
}

interface IncomingOrder {
    id: number;
    orderNumber: string;
    supplierName: string;
    totalAmount: number;
    status: string;
    orderDate: string;
    productId?: number;
    productName?: string;
    quantity?: number;
    unitPrice?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [incomingOrders, setIncomingOrders] = useState<IncomingOrder[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [notifyingProductId, setNotifyingProductId] = useState<number | null>(null);
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" as "success" | "error" | "info" });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        fetchProducts();
        fetchIncomingOrders();
    }, []);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async function fetchProducts() {
        try {
            setLoadingProducts(true);

            const response = await fetch(`${API_BASE_URL}/api/inventory/products?page=0&size=50`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error("Errore caricamento prodotti");
            }

            const data = await response.json();

            setProducts(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.content)
                        ? data.content
                        : []
            );
        } catch (error) {
            console.error("Errore caricamento prodotti:", error);
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    }

    async function fetchIncomingOrders() {
        try {
            setLoadingOrders(true);

            const response = await fetch(`${API_BASE_URL}/api/procurement/orders`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error("Errore caricamento ordini in arrivo");
            }

            const data = await response.json();
            const orders: IncomingOrder[] = Array.isArray(data) ? data : [];

            const sortedOrders = orders
                .filter((order) => order.status === "CREATO")
                .sort((a, b) => b.id - a.id);

            setIncomingOrders(sortedOrders);
        } catch (error) {
            console.error("Errore caricamento ordini in arrivo:", error);
            setIncomingOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    }

    const lowStockProducts = useMemo(() => {
        return products.filter(
            (product) => product.stockQuantity < product.reorderThreshold
        );
    }, [products]);

    function findProductForOrder(order: IncomingOrder) {
        if (order.productId) {
            return products.find((product) => product.id === order.productId);
        }

        if (order.productName) {
            return products.find(
                (product) =>
                    product.name.toLowerCase() === order.productName?.toLowerCase()
            );
        }

        return undefined;
    }

    async function notifyProcurement(product: Product) {
        try {
            setNotifyingProductId(product.id);

            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    targetRole: "PROCUREMENT",
                    title: "Sollecito approvvigionamento",
                    message: `Antonio segnala prodotto sotto soglia: ${product.name}. Giacenza attuale: ${product.stockQuantity}, soglia minima: ${product.reorderThreshold}.`,
                }),
            });

            if (!response.ok) {
                throw new Error("Errore invio notifica");
            }

            setModal({
                isOpen: true,
                title: "Sollecito Inviato",
                message: `Operazione di sollecitazione per ${product.name} inoltrata con successo`,
                type: "success"
            });

        } catch (error) {
            console.error("Errore invio notifica:", error);
            setModal({
                isOpen: true,
                title: "Errore",
                message: "Errore durante l'invio della notifica",
                type: "error"
            });
        } finally {
            setNotifyingProductId(null);
        }
    }

    return (
        <div className="space-y-6">
            <AlertModal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} type={modal.type} />
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Benvenuto Antonio
                </h1>

                <p className="text-slate-500 mt-2 font-medium">
                    Operatore di Magazzino.
                </p>
            </div>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                Prodotti sotto soglia
                            </h2>
                        </div>

                        <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">
                            {lowStockProducts.length} urgenti
                        </span>
                    </div>

                    {loadingProducts ? (
                        <p className="text-slate-500 font-semibold">
                            Caricamento prodotti...
                        </p>
                    ) : lowStockProducts.length === 0 ? (
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-8 text-center">
                            <ClipboardCheck className="w-10 h-10 text-green-600 mx-auto mb-3" />
                            <p className="font-black text-green-700">
                                Nessun prodotto sotto soglia
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                                Le giacenze sono attualmente sotto controllo.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lowStockProducts.map((product) => {
                                const missingQuantity = Math.max(
                                    product.reorderThreshold - product.stockQuantity,
                                    1
                                );

                                const isNotifying = notifyingProductId === product.id;

                                return (
                                    <div
                                        key={product.id}
                                        className="border border-orange-100 bg-orange-50 rounded-2xl p-4"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-white border border-orange-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                                    {product.imageBase64 ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${product.imageBase64}`}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain p-2"
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-orange-500" />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-black text-slate-900">
                                                        {product.name}
                                                    </p>

                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {product.category}
                                                    </p>

                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                                                        <span className="font-bold text-red-600">
                                                            Giacenza: {product.stockQuantity}
                                                        </span>

                                                        <span className="text-slate-500">
                                                            Soglia: {product.reorderThreshold}
                                                        </span>

                                                        <span className="text-orange-700 font-bold">
                                                            Mancano {missingQuantity} pezzi
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="bg-orange-200 text-orange-800 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                                                Sotto soglia
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => notifyProcurement(product)}
                                            disabled={isNotifying}
                                            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-orange-600 disabled:bg-slate-300 text-white rounded-xl py-3 font-black hover:bg-orange-700 transition"
                                        >
                                            <Send className="w-4 h-4" />
                                            {isNotifying
                                                ? "Invio notifica..."
                                                : "Sollecita approvvigionamento"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">
                                Merce in arrivo
                            </h2>
                        </div>

                        <Truck className="w-6 h-6 text-blue-600" />
                    </div>

                    {loadingOrders ? (
                        <p className="text-slate-500 font-semibold">
                            Caricamento ordini in arrivo...
                        </p>
                    ) : incomingOrders.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
                            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="font-black text-slate-600">
                                Nessuna merce in arrivo
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Gli ordini di approvvigionamento creati da Alessia appariranno qui.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {incomingOrders.map((order) => {
                                const orderedProduct = findProductForOrder(order);

                                return (
                                    <div
                                        key={order.id}
                                        className="border border-blue-100 bg-blue-50 rounded-2xl p-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 bg-white border border-blue-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                                                {orderedProduct?.imageBase64 ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${orderedProduct.imageBase64}`}
                                                        alt={
                                                            order.productName ||
                                                            orderedProduct.name ||
                                                            "Prodotto ordinato"
                                                        }
                                                        className="w-full h-full object-contain p-3"
                                                    />
                                                ) : (
                                                    <Package className="w-9 h-9 text-blue-500" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-lg font-black text-slate-900">
                                                            {order.productName ||
                                                                orderedProduct?.name ||
                                                                "Prodotto non specificato"}
                                                        </p>

                                                        <p className="text-sm text-slate-600 mt-1">
                                                            Quantità in arrivo:{" "}
                                                            <span className="font-black text-blue-700">
                                                                {order.quantity ?? "N/D"}
                                                            </span>
                                                        </p>
                                                    </div>

                                                    <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                                                        In arrivo
                                                    </span>
                                                </div>

                                                <div className="bg-white border border-blue-100 rounded-xl p-4 mt-4">

                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Codice ordine
                                                    </p>

                                                    <p className="text-base font-black text-slate-900 truncate mb-3">
                                                        {order.orderNumber}
                                                    </p>

                                                    <div className="flex items-center justify-between gap-4">

                                                        <div>
                                                            <p className="text-xs text-slate-500 font-bold">
                                                                Data ordine
                                                            </p>

                                                            <p className="text-sm font-black text-slate-900">
                                                                {new Date(order.orderDate).toLocaleString("it-IT", {
                                                                    timeZone: "Europe/Rome",
                                                                })}
                                                            </p>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500 font-bold">
                                                                Totale
                                                            </p>

                                                            <p className="text-sm font-black text-blue-700">
                                                                €{Number(order.totalAmount).toFixed(2)}
                                                            </p>
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}