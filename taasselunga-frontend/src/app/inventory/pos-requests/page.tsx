"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowRightLeft,
    ClipboardCheck,
    Package,
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

interface PosRequest {
    id: number;
    storeId: number;
    productId: number;
    quantity: number;
    status: string;
    createdAt: string;
}

export default function PosRequestsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [requests, setRequests] = useState<PosRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

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
        if (typeof status === "string") return status;
        if (status?.statusName) return status.statusName;

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

            if (!productsResponse.ok) {
                throw new Error("Errore caricamento prodotti");
            }

            if (!requestsResponse.ok) {
                throw new Error("Errore caricamento richieste POS");
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

            const normalizedRequests: PosRequest[] = rawRequests.map((request, index) => ({
                id: request.requestId ?? request.id ?? index,
                storeId: request.storeId ?? request.store?.id ?? 0,
                productId: request.productId ?? request.product?.id ?? 0,
                quantity: request.requestedQuantity ?? request.quantity ?? 0,
                status: normalizeStatus(request.status),
                createdAt: request.requestDate ?? request.createdAt ?? "",
            }));

            setProducts(normalizedProducts);
            setRequests(normalizedRequests);
        } catch (error) {
            console.error("Errore caricamento richieste POS:", error);
            setProducts([]);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }

    const pendingRequests = useMemo(() => {
        return requests
            .filter(
                (request) =>
                    request.status !== "SPEDITO" &&
                    request.status !== "COMPLETATA"
            )
            .sort((a, b) => b.id - a.id);
    }, [requests]);

    function findProduct(productId: number) {
        return products.find((product) => product.id === productId);
    }

    async function sendPosNotification(productName: string) {
        await fetch("http://localhost:8080/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify({
                targetRole: "POS",
                title: "Spedizione in arrivo",
                message: `La spedizione per ${productName} è stata preparata dal magazzino centrale ed è in arrivo al punto vendita.`,
            }),
        });
    }

    async function prepareShipment(request: PosRequest) {
        try {
            setProcessingId(request.id);

            const product = findProduct(request.productId);

            const response = await fetch(
                `http://localhost:8080/api/pos/requests/${request.id}/status?status=SPEDITO`,
                {
                    method: "PATCH",
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const text = await response.text();

                if (
                    text.toLowerCase().includes("stock") ||
                    text.toLowerCase().includes("giacenza") ||
                    text.toLowerCase().includes("insufficient")
                ) {
                    throw new Error(
                        "Stock insufficiente nel magazzino centrale per evadere questa richiesta"
                    );
                }

                throw new Error(`Errore aggiornamento richiesta: ${response.status} ${text}`);
            }

            await sendPosNotification(product?.name || "il prodotto richiesto");

            alert("Spedizione preparata con successo");

            await loadData();
        } catch (error) {
            console.error("Errore preparazione spedizione:", error);

            alert(
                error instanceof Error
                    ? error.message
                    : "Errore durante la preparazione della spedizione"
            );
        } finally {
            setProcessingId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Richieste punti vendita
                </h1>

                <p className="text-slate-500 mt-2 font-medium">
                    Gestisci le richieste di rifornimento provenienti dai punti vendita.
                </p>
            </div>

            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">

                {loading ? (
                    <p className="text-slate-500 font-semibold">
                        Caricamento richieste...
                    </p>
                ) : pendingRequests.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
                        <ClipboardCheck className="w-10 h-10 text-green-600 mx-auto mb-3" />

                        <p className="font-black text-slate-700">
                            Nessuna richiesta da evadere
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            Tutte le richieste dei punti vendita risultano già spedite.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                        {pendingRequests.map((request) => {
                            const product = findProduct(request.productId);
                            const isProcessing = processingId === request.id;

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
                                                        {product?.name || "Prodotto non trovato"}
                                                    </p>

                                                    <p className="text-sm text-slate-600 mt-1">
                                                        Quantità richiesta:{" "}
                                                        <span className="font-black text-blue-700">
                                                            {request.quantity}
                                                        </span>
                                                    </p>
                                                </div>

                                                <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full">
                                                    {request.status}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Punto vendita
                                                    </p>

                                                    <p className="text-sm font-black text-slate-900">
                                                        #{request.storeId}
                                                    </p>
                                                </div>

                                                <div className="bg-white border border-blue-100 rounded-xl p-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Disponibilità
                                                    </p>

                                                    <p className="text-sm font-black text-slate-900">
                                                        {product?.stockQuantity ?? 0} pezzi
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => prepareShipment(request)}
                                                disabled={isProcessing}
                                                className="mt-5 w-full bg-blue-700 disabled:bg-slate-300 text-white rounded-2xl py-3 font-black hover:bg-blue-800 transition inline-flex items-center justify-center gap-2"
                                            >
                                                <ArrowRightLeft className="w-5 h-5" />

                                                {isProcessing
                                                    ? "Preparazione in corso..."
                                                    : "Prepara spedizione"}
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