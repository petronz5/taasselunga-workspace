"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList, Package } from "lucide-react";

interface PurchaseOrder {
    id: number;
    orderNumber: string;
    orderDate: string;
    productName: string;
    totalAmount: number;
    status: string;
}

interface Product {
    id: number;
    name: string;
    imageBase64?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [products, setProducts] = useState<Record<string, Product>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("access_token");

        return {
            Authorization: `Bearer ${token}`,
        };
    };

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            setError("");

            const [ordersResponse, productsResponse] = await Promise.all([
                fetch("http://localhost:8080/api/procurement/orders", {
                    headers: getAuthHeaders(),
                }),
                fetch("http://localhost:8080/api/inventory/products?page=0&size=50", {
                    headers: getAuthHeaders(),
                }),
            ]);

            if (!ordersResponse.ok) {
                throw new Error(`Errore ${ordersResponse.status} nel caricamento degli ordini`);
            }

            if (!productsResponse.ok) {
                throw new Error(`Errore ${productsResponse.status} nel caricamento dei prodotti`);
            }

            const ordersData: PurchaseOrder[] = await ordersResponse.json();
            const productsData = await productsResponse.json();

            const normalizedProducts: Product[] = Array.isArray(productsData)
                ? productsData
                : Array.isArray(productsData.content)
                    ? productsData.content
                    : [];

            const productMap: Record<string, Product> = {};

            normalizedProducts.forEach((product) => {
                productMap[product.name.toLowerCase()] = product;
            });

            const sortedOrders = ordersData.sort((a, b) => {
                const dateA = new Date(a.orderDate).getTime();
                const dateB = new Date(b.orderDate).getTime();

                if (dateB !== dateA) {
                    return dateB - dateA;
                }

                return b.id - a.id;
            });

            setProducts(productMap);
            setOrders(sortedOrders);
        } catch (error: any) {
            console.error("Errore nel caricamento ordini:", error);
            setError(error.message || "Errore nel caricamento degli ordini");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        if (status === "CREATO") return "In consegna";
        if (status === "CONSEGNATO") return "Consegnato";
        return "Stato non valido";
    };

    const getStatusClassName = (status: string) => {
        if (status === "CREATO") return "bg-blue-100 text-blue-700";
        if (status === "CONSEGNATO") return "bg-green-100 text-green-700";
        return "bg-red-100 text-red-700";
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800">
                        Ordini
                    </h2>

                    <p className="text-gray-500 font-medium mt-1">
                        Storico ordini di approvvigionamento verso i fornitori
                    </p>
                </div>
            </div>

            {isLoading && (
                <p className="text-center font-bold py-8">
                    Caricamento ordini in corso...
                </p>
            )}

            {!isLoading && error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 font-bold">
                    {error}
                </div>
            )}

            {!isLoading && !error && orders.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                    <ClipboardList className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 font-bold">Nessun ordine inviato</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Gli ordini inviati dalla dashboard appariranno qui.
                    </p>
                </div>
            )}

            {!isLoading && !error && orders.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                                <th className="p-4 font-bold">Immagine</th>
                                <th className="p-4 font-bold">N° Ordine</th>
                                <th className="p-4 font-bold">Prodotto</th>
                                <th className="p-4 font-bold">Data</th>
                                <th className="p-4 font-bold text-right">Totale (€)</th>
                                <th className="p-4 font-bold text-center">Stato</th>
                            </tr>
                            </thead>

                            <tbody className="text-sm">
                            {orders.map((order) => {
                                const product = order.productName
                                    ? products[order.productName.toLowerCase()]
                                    : undefined;

                                return (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="w-14 h-14 bg-white border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                                                {product?.imageBase64 ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${product.imageBase64}`}
                                                        alt={order.productName}
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <Package className="w-6 h-6 text-gray-400" />
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-4 font-bold text-blue-900">
                                            {order.orderNumber}
                                        </td>

                                        <td className="p-4 font-medium text-gray-800">
                                            {order.productName}
                                        </td>

                                        <td className="p-4 text-gray-600">
                                            {order.orderDate}
                                        </td>

                                        <td className="p-4 text-right font-black text-gray-800">
                                            €{order.totalAmount.toFixed(2)}
                                        </td>

                                        <td className="p-4 text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusClassName(order.status)}`}
                                            >
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}