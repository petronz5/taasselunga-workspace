"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";

interface ReplenishmentStatus {
    statusName: string;
}

interface ReplenishmentRequest {
    requestId: number;
    productId: number;
    requestedQuantity: number;
    status: ReplenishmentStatus | string;
    requestDate: string;
}

interface Product {
    id: number;
    name: string;
    imageBase64?: string;
}

export default function PosReplenishmentPage() {
    const [requests, setRequests] = useState<ReplenishmentRequest[]>([]);
    const [products, setProducts] = useState<Record<number, Product>>({});
    const [loading, setLoading] = useState(true);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    function getStatusName(status: ReplenishmentRequest["status"]) {
        if (typeof status === "string") return status;

        return status?.statusName ?? "SCONOSCIUTO";
    }

    function formatDate(dateString: string) {
        try {
            return new Date(dateString).toLocaleString("it-IT");
        } catch {
            return dateString;
        }
    }

    useEffect(() => {
        async function fetchRequests() {
            try {
                const [reqRes, prodRes] = await Promise.all([
                    fetch("http://localhost:8080/api/pos/store/1/requests", {
                        headers: getAuthHeaders(),
                    }),
                    fetch("http://localhost:8080/api/inventory/products?page=0&size=50", {
                        headers: getAuthHeaders(),
                    }),
                ]);

                if (!reqRes.ok) {
                    const text = await reqRes.text();

                    throw new Error(
                        `Errore caricamento richieste: ${reqRes.status} ${text}`
                    );
                }

                if (!prodRes.ok) {
                    const text = await prodRes.text();

                    throw new Error(
                        `Errore caricamento prodotti: ${prodRes.status} ${text}`
                    );
                }

                const reqData = await reqRes.json();
                const prodData = await prodRes.json();

                const requestsArray: ReplenishmentRequest[] =
                    Array.isArray(reqData)
                        ? reqData
                        : reqData.content || [];

                requestsArray.sort((a, b) => {
                    return (
                        new Date(b.requestDate).getTime() -
                        new Date(a.requestDate).getTime()
                    );
                });

                setRequests(requestsArray);

                const prodArray: Product[] = Array.isArray(prodData)
                    ? prodData
                    : prodData.content || [];

                const prodMap: Record<number, Product> = {};

                prodArray.forEach((p) => {
                    prodMap[p.id] = p;
                });

                setProducts(prodMap);
            } catch (error) {
                console.error(
                    "Errore caricamento pagina replenishment",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        fetchRequests();
    }, []);

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                Storico Richieste di Rifornimento
            </h1>

            {loading ? (
                <p className="text-slate-500">
                    Caricamento richieste...
                </p>
            ) : requests.length === 0 ? (
                <p className="text-slate-500">
                    Nessuna richiesta trovata.
                </p>
            ) : (
                <div className="space-y-4">
                    {requests.map((req, index) => {
                        const statusName = getStatusName(req.status);
                        const product = products[req.productId];

                        return (
                            <div
                                key={req.requestId ?? `${req.productId}-${index}`}
                                className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50 gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                        {product?.imageBase64 ? (
                                            <img
                                                src={`data:image/jpeg;base64,${product.imageBase64}`}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <ClipboardList className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-black text-slate-900 text-lg">
                                            {product?.name ||
                                                `Prodotto ID: ${req.productId}`}
                                        </p>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Quantità richiesta:{" "}
                                            {req.requestedQuantity}
                                        </p>

                                        <p className="text-xs text-slate-400 mt-1">
                                            Data richiesta:{" "}
                                            {formatDate(req.requestDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {statusName === "PENDING" ||
                                    statusName === "INVIATA" ? (
                                        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black">
                                            <Clock className="w-4 h-4" />
                                            INVIATA
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                            <CheckCircle className="w-4 h-4" />
                                            COMPLETATA
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}