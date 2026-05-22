"use client";

import React, { useEffect, useState } from "react";
import { FileText, Package, Send } from "lucide-react";

interface Product {
    id: number;
    name: string;
    category: string;
    stockQuantity: number;
    reorderThreshold: number;
    price: number;
    imageUrl?: string;
}

export default function DashboardPage() {
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [draftQuantities, setDraftQuantities] = useState<Record<number, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingOrderId, setIsSubmittingOrderId] = useState<number | null>(null);

    useEffect(() => {
        fetchLowStockProducts();
    }, []);

    const fetchLowStockProducts = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch("http://localhost:8081/api/inventory/products", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Errore nel caricamento dei prodotti");
            }

            const products: Product[] = await response.json();

            const filteredProducts = products.filter(
                (product) => product.stockQuantity < product.reorderThreshold
            );

            const initialQuantities = filteredProducts.reduce<Record<number, number>>(
                (acc, product) => {
                    acc[product.id] = Math.max(
                        product.reorderThreshold - product.stockQuantity,
                        1
                    );

                    return acc;
                },
                {}
            );

            setLowStockProducts(filteredProducts);
            setDraftQuantities(initialQuantities);
        } catch (error) {
            console.error("Errore caricamento prodotti sotto soglia:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (productId: number, value: string) => {
        const quantity = Number(value);

        setDraftQuantities((prev) => ({
            ...prev,
            [productId]: quantity < 0 ? 0 : quantity,
        }));
    };

    const handleSendOrder = async (product: Product) => {
        const token = localStorage.getItem("access_token");
        const quantity = draftQuantities[product.id] ?? 1;
        const totalAmount = quantity * product.price;

        if (quantity <= 0) {
            return;
        }

        try {
            setIsSubmittingOrderId(product.id);

            const response = await fetch("http://localhost:8080/api/procurement/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderNumber: `ORD-${Date.now()}`,
                    supplierName: "Fornitore da assegnare",
                    totalAmount,
                    status: "IN_ATTESA",

                    productId: product.id,
                    productName: product.name,
                    quantity,
                    unitPrice: product.price,
                }),
            });

            if (!response.ok) {
                throw new Error("Errore nella creazione dell'ordine");
            }

            alert(`Ordine inviato per ${product.name}`);
        } catch (error) {
            console.error("Errore invio ordine:", error);
            alert("Errore durante l'invio dell'ordine");
        } finally {
            setIsSubmittingOrderId(null);
        }
    };

    return (
        <>
            <header className="mb-8 mt-4 md:mt-0">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
                    Benvenuta, Alessia
                </h2>

                <p className="text-gray-500 font-medium">
                    Ecco il riepilogo della situazione attuale.
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">
                            Prodotti sotto soglia
                        </h3>

                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                            {lowStockProducts.length} urgenti
                        </span>
                    </div>

                    <div className="space-y-4 flex-1">
                        {isLoading && (
                            <p className="text-gray-500 font-medium">
                                Caricamento prodotti...
                            </p>
                        )}

                        {!isLoading && lowStockProducts.length === 0 && (
                            <p className="text-green-600 font-bold">
                                Nessun prodotto sotto soglia
                            </p>
                        )}

                        {lowStockProducts.map((product) => (
                            <div
                                key={product.id}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-100 rounded-xl gap-4 shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Package className="w-6 h-6 text-gray-500" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">
                                            {product.name}
                                        </p>

                                        <p className="text-xs text-gray-400 font-medium">
                                            {product.category}
                                        </p>

                                        <div className="flex items-center gap-4 mt-1 text-sm">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-red-500" />

                                                <span className="text-gray-500">
                                                    Giacenza:
                                                </span>

                                                <span className="font-black text-red-600">
                                                    {product.stockQuantity}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                                                <span className="text-gray-500">
                                                    Soglia min:
                                                </span>

                                                <span className="font-bold text-gray-700">
                                                    {product.reorderThreshold}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold">
                                    Richiede approvvigionamento
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">
                            Bozze d&apos;ordine
                        </h3>

                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                            {lowStockProducts.length} da inviare
                        </span>
                    </div>

                    <div className="space-y-4 flex-1">
                        {isLoading && (
                            <p className="text-gray-500 font-medium">
                                Generazione bozze in corso...
                            </p>
                        )}

                        {!isLoading && lowStockProducts.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                                <FileText className="w-10 h-10 text-gray-300 mb-3" />

                                <p className="text-gray-500 font-bold mb-1">
                                    Nessuna bozza da confermare
                                </p>

                                <p className="text-xs text-gray-400 max-w-[250px]">
                                    Le bozze generate automaticamente per i prodotti sotto soglia appariranno qui.
                                </p>
                            </div>
                        )}

                        {lowStockProducts.map((product) => {
                            const quantity = draftQuantities[product.id] ?? 1;
                            const totalAmount = quantity * product.price;
                            const isSubmitting = isSubmittingOrderId === product.id;

                            return (
                                <div
                                    key={product.id}
                                    className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-black text-gray-900">
                                                Bozza ordine - {product.name}
                                            </p>

                                            <p className="text-xs text-gray-500 mt-1">
                                                Giacenza attuale: {product.stockQuantity} / Soglia minima: {product.reorderThreshold}
                                            </p>
                                        </div>

                                        <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">
                                                Quantità da ordinare
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                value={quantity}
                                                onChange={(event) =>
                                                    handleQuantityChange(product.id, event.target.value)
                                                }
                                                className="w-full border border-blue-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 mb-1">
                                                Totale stimato
                                            </label>

                                            <div className="w-full bg-white border border-blue-100 rounded-lg p-2.5 text-sm font-black text-blue-700">
                                                €{totalAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSendOrder(product)}
                                        disabled={quantity <= 0 || isSubmitting}
                                        className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 text-sm font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    >
                                        <Send className="w-4 h-4" />
                                        {isSubmitting ? "Invio ordine..." : "Invia ordine"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}