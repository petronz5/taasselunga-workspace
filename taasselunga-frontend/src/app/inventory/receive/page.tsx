"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Package, Truck } from "lucide-react";

interface Product {
    id: number;
    name: string;
    category: string;
    stockQuantity: number;
    reorderThreshold: number;
    price: number;
    imageUrl?: string;
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

export default function ReceiveGoodsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<IncomingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [receivingOrderId, setReceivingOrderId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async function loadData() {
        try {
            setLoading(true);

            const [productsResponse, ordersResponse] = await Promise.all([
                fetch("http://localhost:8080/api/inventory/products?page=0&size=50", {
                    headers: getAuthHeaders(),
                }),
                fetch("http://localhost:8080/api/procurement/orders", {
                    headers: getAuthHeaders(),
                }),
            ]);

            if (!productsResponse.ok) {
                throw new Error("Errore caricamento prodotti");
            }

            if (!ordersResponse.ok) {
                throw new Error("Errore caricamento ordini");
            }

            const productsData = await productsResponse.json();
            const ordersData = await ordersResponse.json();

            const normalizedProducts: Product[] = Array.isArray(productsData)
                ? productsData
                : Array.isArray(productsData.content)
                    ? productsData.content
                    : [];

            const normalizedOrders: IncomingOrder[] = Array.isArray(ordersData)
                ? ordersData
                : Array.isArray(ordersData.content)
                    ? ordersData.content
                    : [];

            setProducts(normalizedProducts);
            setOrders(normalizedOrders);
        } catch (error) {
            console.error("Errore caricamento ricezione merce:", error);
            setProducts([]);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }

    const incomingOrders = useMemo(() => {
        return orders
            .filter((order) => order.status === "CREATO")
            .sort((a, b) => b.id - a.id);
    }, [orders]);

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

    async function confirmReceipt(order: IncomingOrder) {
        if (receivingOrderId !== null) {
            return;
        }

        if (!order.productId || !order.quantity) {
            alert("Ordine incompleto: prodotto o quantità mancanti");
            return;
        }

        try {
            setReceivingOrderId(order.id);

            const statusResponse = await fetch(
                `http://localhost:8080/api/procurement/orders/${order.id}/status?status=CONSEGNATO`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                }
            );

            if (!statusResponse.ok) {
                throw new Error("Errore aggiornamento stato ordine");
            }

            alert(`Merce ricevuta per ordine ${order.orderNumber}`);

            await loadData();
        } catch (error) {
            console.error("Errore conferma ricezione:", error);
            alert("Errore durante la conferma della ricezione merce");
        } finally {
            setReceivingOrderId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Ricezione merce
                </h1>

                <p className="text-slate-500 mt-2 font-medium">
                    Verifica gli ordini di approvvigionamento in arrivo e registra la merce consegnata dai fornitori.
                </p>
            </div>

            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                {loading ? (
                    <p className="text-slate-500 font-semibold">
                        Caricamento ordini in arrivo...
                    </p>
                ) : incomingOrders.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
                        <ClipboardCheck className="w-10 h-10 text-green-600 mx-auto mb-3" />

                        <p className="font-black text-slate-700">
                            Nessuna merce da ricevere
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            Non ci sono ordini di approvvigionamento in attesa di consegna.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {incomingOrders.map((order) => {
                            const product = findProductForOrder(order);
                            const isReceiving = receivingOrderId === order.id;

                            return (
                                <div
                                    key={order.id}
                                    className="border border-blue-100 bg-blue-50 rounded-3xl p-5"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-24 h-24 bg-white border border-blue-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                                            {product?.imageUrl ? (
                                                <img
                                                    src={`/products/${product.imageUrl}`}
                                                    alt={
                                                        order.productName ||
                                                        product.name ||
                                                        "Prodotto ordinato"
                                                    }
                                                    className="w-full h-full object-contain p-3"
                                                />
                                            ) : (
                                                <Package className="w-10 h-10 text-blue-500" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-lg font-black text-slate-900">
                                                        {order.productName ||
                                                            product?.name ||
                                                            "Prodotto non specificato"}
                                                    </p>

                                                    <p className="text-sm text-slate-600 mt-1">
                                                        Quantità attesa:{" "}
                                                        <span className="font-black text-blue-700">
                                                            {order.quantity ?? "N/D"}
                                                        </span>
                                                    </p>
                                                </div>

                                                <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                                                    In arrivo
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Codice ordine
                                                    </p>
                                                    <p className="text-sm font-black text-slate-900 truncate">
                                                        {order.orderNumber}
                                                    </p>
                                                </div>

                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Fornitore
                                                    </p>
                                                    <p className="text-sm font-black text-slate-900 truncate">
                                                        {order.supplierName}
                                                    </p>
                                                </div>

                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Data ordine
                                                    </p>
                                                    <p className="text-sm font-black text-slate-900">
                                                        {order.orderDate}
                                                    </p>
                                                </div>

                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Totale
                                                    </p>
                                                    <p className="text-sm font-black text-blue-700">
                                                        €{Number(order.totalAmount).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => confirmReceipt(order)}
                                                disabled={isReceiving}
                                                className="mt-5 w-full bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl py-3 font-black hover:bg-blue-800 transition inline-flex items-center justify-center gap-2"
                                            >
                                                <ClipboardCheck className="w-5 h-5" />
                                                {isReceiving
                                                    ? "Registrazione in corso..."
                                                    : "Conferma ricezione merce"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}