"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";

interface PurchaseOrder {
    id: number;
    orderNumber: string;
    orderDate: string;
    supplierName: string;
    totalAmount: number;
    status: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch("http://localhost:8080/api/procurement/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Errore nel caricamento degli ordini");
            }

            const data: PurchaseOrder[] = await response.json();
            setOrders(data);
        } catch (error) {
            console.error("Errore nel caricamento ordini:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusClassName = (status: string) => {
        if (status === "CONSEGNATO") {
            return "bg-green-100 text-green-700";
        }

        if (status === "IN_ATTESA") {
            return "bg-yellow-100 text-yellow-700";
        }

        if (status === "SPEDITO") {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-gray-100 text-gray-700";
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800">
                        Storico ordini di approvvigionamento
                    </h2>

                    <p className="text-gray-500 font-medium mt-1">
                        Monitora gli ordini inviati ai fornitori e il loro stato di avanzamento.
                    </p>
                </div>
            </div>

            {isLoading && (
                <p className="text-center font-bold py-8">
                    Caricamento ordini in corso...
                </p>
            )}

            {!isLoading && orders.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />

                    <p className="text-gray-600 font-bold">
                        Nessun ordine inviato
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                        Gli ordini inviati dalla dashboard appariranno qui.
                    </p>
                </div>
            )}

            {!isLoading && orders.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                                <th className="p-4 font-bold">N° Ordine</th>
                                <th className="p-4 font-bold">Data</th>
                                <th className="p-4 font-bold">Fornitore</th>
                                <th className="p-4 font-bold text-right">Totale (€)</th>
                                <th className="p-4 font-bold text-center">Stato</th>
                            </tr>
                            </thead>

                            <tbody className="text-sm">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="p-4 font-bold text-blue-900">
                                        {order.orderNumber}
                                    </td>

                                    <td className="p-4 text-gray-600">
                                        {order.orderDate}
                                    </td>

                                    <td className="p-4 font-medium text-gray-800">
                                        {order.supplierName}
                                    </td>

                                    <td className="p-4 text-right font-black text-gray-800">
                                        €{order.totalAmount.toFixed(2)}
                                    </td>

                                    <td className="p-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusClassName(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}