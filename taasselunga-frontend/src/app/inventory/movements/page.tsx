"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowRightLeft,
    Package,
    Store,
    Truck,
} from "lucide-react";

interface Product {
    id: number;
    name: string;
    category: string;
    stockQuantity: number;
    reorderThreshold: number;
    price: number;
    imageBase64?: string;
}

interface MovementRequest {
    id: number;
    storeId: number;
    productId: number;
    quantity: number;
    status: string;
    createdAt: string;
}

export default function InventoryMovementsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [requests, setRequests] = useState<MovementRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    function normalizeStatus(status: any) {
        if (typeof status === "string") {
            return status;
        }

        if (status?.statusName) {
            return status.statusName;
        }

        return "CREATO";
    }

    async function loadData() {
        try {
            setLoading(true);

            const [productsResponse, requestsResponse] = await Promise.all([
                fetch("http://localhost:8080/api/inventory/products?page=0&size=50", {
                    headers: getAuthHeaders(),
                }),
                fetch("http://localhost:8080/api/pos/requests", {
                    headers: getAuthHeaders(),
                }),
            ]);

            if (!productsResponse.ok || !requestsResponse.ok) {
                throw new Error("Errore caricamento movimenti");
            }

            const productsData = await productsResponse.json();
            const requestsData = await requestsResponse.json();

            const normalizedProducts: Product[] = Array.isArray(productsData)
                ? productsData
                : Array.isArray(productsData.content)
                    ? productsData.content
                    : [];

            const rawRequests: any[] = Array.isArray(requestsData)
                ? requestsData
                : Array.isArray(requestsData.content)
                    ? requestsData.content
                    : [];

            const normalizedRequests: MovementRequest[] = rawRequests.map(
                (request, index) => ({
                    id: request.id ?? index,
                    storeId: request.storeId ?? request.store?.id ?? 0,
                    productId: request.productId ?? request.product?.id ?? 0,
                    quantity: request.quantity ?? 0,
                    status: normalizeStatus(request.status),
                    createdAt:
                        request.createdAt ??
                        request.requestDate ??
                        new Date().toISOString(),
                })
            );

            setProducts(normalizedProducts);
            setRequests(normalizedRequests);
        } catch (error) {
            console.error("Errore caricamento movimenti:", error);
            setProducts([]);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }

    const shippedRequests = useMemo(() => {
        return requests
            .filter((request) => request.status === "SPEDITO")
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
    }, [requests]);

    function findProduct(productId: number) {
        return products.find((product) => product.id === productId);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Storico spedizioni movimenti verso i supermercati
                </h1>

                <p className="text-sm text-slate-500 font-medium">
                    Movimenti dei prodotti dal magazzino centrale verso i punti vendita.
                </p>
            </div>

            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                {loading ? (
                    <p className="text-slate-500 font-semibold">
                        Caricamento movimenti...
                    </p>
                ) : shippedRequests.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
                        <ArrowRightLeft className="w-10 h-10 text-slate-400 mx-auto mb-3" />

                        <p className="font-black text-slate-700">
                            Nessun movimento registrato
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            Le spedizioni completate compariranno qui.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {shippedRequests.map((request) => {
                            const product = findProduct(request.productId);

                            return (
                                <div
                                    key={request.id}
                                    className="border border-blue-100 bg-blue-50 rounded-3xl p-5"
                                >
                                    <div className="flex items-start gap-5">
                                        <div className="w-24 h-24 bg-white border border-blue-100 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                                            {product?.imageBase64 ? (
                                                <img
                                                    src={`data:image/jpeg;base64,${product.imageBase64}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain p-3"
                                                />
                                            ) : (
                                                <Package className="w-10 h-10 text-blue-500" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-lg font-black text-slate-900">
                                                        {product?.name ||
                                                            "Prodotto"}
                                                    </p>

                                                    <p className="text-sm text-slate-600 mt-1">
                                                        Quantità spedita:{" "}
                                                        <span className="font-black text-blue-700">
                                                            {request.quantity}
                                                        </span>
                                                    </p>
                                                </div>

                                                <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full">
                                                    SPEDITO
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Punto vendita
                                                    </p>

                                                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                        <Store className="w-4 h-4" />
                                                        POS #{request.storeId}
                                                    </p>
                                                </div>

                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Data spedizione
                                                    </p>

                                                    <p className="text-sm font-black text-slate-900">
                                                        {new Date(
                                                            request.createdAt
                                                        ).toLocaleString("it-IT")}
                                                    </p>
                                                </div>
                                            </div>
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