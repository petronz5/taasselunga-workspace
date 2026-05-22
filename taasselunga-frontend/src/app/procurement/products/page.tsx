"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Search, ShoppingCart } from "lucide-react";

interface Product {
    id: number;
    name: string;
    category: string;
    stockQuantity: number;
    reorderThreshold: number;
    price: number;
    imageUrl?: string;
}

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [orderQuantities, setOrderQuantities] = useState<Record<number, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmittingOrderId, setIsSubmittingOrderId] = useState<number | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                "http://localhost:8081/api/inventory/products",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Errore nel caricamento dei prodotti");
            }

            const data: Product[] = await response.json();

            const initialQuantities = data.reduce<Record<number, number>>(
                (acc, product) => {
                    acc[product.id] = Math.max(
                        product.reorderThreshold - product.stockQuantity,
                        1
                    );

                    return acc;
                },
                {}
            );

            setProducts(data);
            setOrderQuantities(initialQuantities);
        } catch (error) {
            console.error("Errore caricamento prodotti:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter(
            (product) =>
                product.name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                product.category
                    .toLowerCase()
                    .includes(search.toLowerCase())
        );
    }, [products, search]);

    const handleQuantityChange = (
        productId: number,
        value: string
    ) => {
        const quantity = Number(value);

        setOrderQuantities((prev) => ({
            ...prev,
            [productId]: quantity < 0 ? 0 : quantity,
        }));
    };

    const handleCreateOrder = async (product: Product) => {
        const token = localStorage.getItem("access_token");

        const quantity = orderQuantities[product.id] ?? 1;

        const totalAmount = quantity * product.price;

        if (quantity <= 0) {
            return;
        }

        try {
            setIsSubmittingOrderId(product.id);

            const response = await fetch(
                "http://localhost:8080/api/procurement/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderNumber: `ORD-${Date.now()}`,
                        supplierName: "Fornitore da assegnare",
                        totalAmount,

                        // Stato iniziale ordine procurement
                        status: "CREATO",

                        productId: product.id,
                        productName: product.name,
                        quantity,
                        unitPrice: product.price,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Errore nella creazione dell'ordine"
                );
            }

            alert(`Ordine creato per ${product.name}`);
        } catch (error) {
            console.error("Errore creazione ordine:", error);

            alert("Errore durante la creazione dell'ordine");
        } finally {
            setIsSubmittingOrderId(null);
        }
    };

    const getStockBadgeClassName = (product: Product) => {
        if (product.stockQuantity < product.reorderThreshold) {
            return "bg-red-100 text-red-700";
        }

        return "bg-green-100 text-green-700";
    };

    const getStockLabel = (product: Product) => {
        if (product.stockQuantity < product.reorderThreshold) {
            return "Sotto soglia";
        }

        return "Disponibile";
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800">
                        Catalogo prodotti ordinabili
                    </h2>

                    <p className="text-gray-500 font-medium mt-1">
                        Consulta i prodotti disponibili e crea direttamente
                        un ordine di approvvigionamento.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

                    <input
                        type="text"
                        placeholder="Cerca prodotto o categoria..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                </div>
            </div>

            {isLoading && (
                <p className="text-center font-bold py-8">
                    Caricamento prodotti...
                </p>
            )}

            {!isLoading && filteredProducts.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />

                    <p className="text-gray-600 font-bold">
                        Nessun prodotto trovato
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                        Prova a modificare la ricerca.
                    </p>
                </div>
            )}

            {!isLoading && filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                        const quantity =
                            orderQuantities[product.id] ?? 1;

                        const totalAmount =
                            quantity * product.price;

                        const isSubmitting =
                            isSubmittingOrderId === product.id;

                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-all"
                            >
                                <div className="h-52 bg-gray-100 relative flex items-center justify-center overflow-hidden">
                                    {product.imageUrl ? (
                                        <img
                                            src={`/products/${product.imageUrl}`}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-4 bg-white"
                                        />
                                    ) : (
                                        <Package className="w-12 h-12 text-gray-300" />
                                    )}

                                    <span
                                        className={`absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full ${getStockBadgeClassName(
                                            product
                                        )}`}
                                    >
                                        {getStockLabel(product)}
                                    </span>
                                </div>

                                <div className="p-4 flex-1 flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase">
                                        {product.category}
                                    </span>

                                    <h3 className="text-lg font-bold text-gray-800 mt-1 mb-4">
                                        {product.name}
                                    </h3>

                                    <div className="space-y-2 text-sm mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">
                                                Giacenza:
                                            </span>

                                            <span className="font-bold text-gray-800">
                                                {product.stockQuantity} pz
                                            </span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-gray-500">
                                                Soglia minima:
                                            </span>

                                            <span className="font-bold text-gray-800">
                                                {product.reorderThreshold} pz
                                            </span>
                                        </div>

                                        <div className="flex justify-between pt-2 border-t border-gray-100">
                                            <span className="text-gray-500">
                                                Prezzo unitario:
                                            </span>

                                            <span className="font-black text-blue-900">
                                                €{product.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto bg-gray-50 border border-gray-100 rounded-xl p-3">
                                        <label className="block text-xs font-bold text-gray-600 mb-1">
                                            Quantità da ordinare
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            value={quantity}
                                            onChange={(event) =>
                                                handleQuantityChange(
                                                    product.id,
                                                    event.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />

                                        <div className="flex justify-between items-center mt-3 text-sm">
                                            <span className="text-gray-500 font-medium">
                                                Totale stimato:
                                            </span>

                                            <span className="font-black text-blue-900">
                                                €{totalAmount.toFixed(2)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() =>
                                                handleCreateOrder(product)
                                            }
                                            disabled={
                                                quantity <= 0 ||
                                                isSubmitting
                                            }
                                            className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 text-sm font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ShoppingCart className="w-4 h-4" />

                                            {isSubmitting
                                                ? "Creazione ordine..."
                                                : "Crea ordine"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}