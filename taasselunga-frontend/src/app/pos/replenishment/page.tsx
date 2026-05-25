"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle } from "lucide-react";

interface ReplenishmentRequest {
    id: number;
    productId: number;
    quantity: number;
    status: string;
    requestDate: string;
}

interface Product {
    id: number;
    name: string;
}

export default function PosReplenishmentPage() {
    const [requests, setRequests] = useState<ReplenishmentRequest[]>([]);
    const [products, setProducts] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");
        return { Authorization: `Bearer ${token}` };
    }

    useEffect(() => {
        async function fetchRequests() {
            try {
                const [reqRes, prodRes] = await Promise.all([
                    fetch("http://localhost:8080/api/pos/replenishment/1", { headers: getAuthHeaders() }),
                    fetch("http://localhost:8080/api/inventory/products?page=0&size=50", { headers: getAuthHeaders() })
                ]);

                const reqData = await reqRes.json();
                const prodData = await prodRes.json();

                setRequests(Array.isArray(reqData) ? reqData : []);

                const prodArray: Product[] = Array.isArray(prodData) ? prodData : prodData.content || [];
                const prodMap: Record<number, string> = {};
                prodArray.forEach(p => prodMap[p.id] = p.name);
                setProducts(prodMap);
            } catch (error) {
                console.error("Failed to load requests", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRequests();
    }, []);

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-blue-600" /> Replenishment History
            </h1>

            {loading ? (
                <p className="text-slate-500">Loading requests...</p>
            ) : requests.length === 0 ? (
                <p className="text-slate-500">No requests found.</p>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="flex items-center justify-between p-5 border border-slate-100 rounded-2xl bg-slate-50">
                            <div>
                                <p className="font-black text-slate-900 text-lg">
                                    {products[req.productId] || `Product ID: ${req.productId}`}
                                </p>
                                <p className="text-sm text-slate-500 mt-1">Requested Quantity: {req.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {req.status === 'PENDING' ? (
                                    <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black">
                                        <Clock className="w-4 h-4" /> PENDING
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                        <CheckCircle className="w-4 h-4" /> {req.status}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}