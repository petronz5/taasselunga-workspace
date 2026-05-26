"use client";

import React, { useEffect, useState } from "react";
import { Package, ShoppingCart, Search, Warehouse } from "lucide-react";

interface StoreStock {
    productId: number;
    availableQuantity: number;
    minimumLevel: number;
}

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    stockQuantity: number;
    imageUrl?: string;
    barcode?: string;
}

interface CombinedProduct extends Product {
    availableQuantity: number;
    minimumLevel: number;
}

export default function PosProductsPage() {
    const [products, setProducts] = useState<CombinedProduct[]>([]);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [submittingProductId, setSubmittingProductId] = useState<number | null>(null);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");
        return { Authorization: `Bearer ${token}` };
    }

    useEffect(() => {
        async function fetchCatalog() {
            try {
                const [productsRes, stockRes] = await Promise.all([
                    fetch("http://localhost:8080/api/pos/products", {
                        headers: getAuthHeaders(),
                    }),
                    fetch("http://localhost:8080/api/pos/store-stock/1", {
                        headers: getAuthHeaders(),
                    }),
                ]);

                if (!productsRes.ok) {
                    const text = await productsRes.text();
                    throw new Error(`Errore caricamento prodotti: ${productsRes.status} ${text}`);
                }

                if (!stockRes.ok) {
                    const text = await stockRes.text();
                    throw new Error(`Errore caricamento stock: ${stockRes.status} ${text}`);
                }

                const productsData = await productsRes.json();
                const stockData = await stockRes.json();

                const normalizedProducts: Product[] = Array.isArray(productsData)
                    ? productsData
                    : productsData.content || [];

                const normalizedStock: StoreStock[] = Array.isArray(stockData)
                    ? stockData
                    : stockData.content || [];

                const combined = normalizedProducts.map((product) => {
                    const stock = normalizedStock.find((s) => s.productId === product.id);

                    return {
                        ...product,
                        availableQuantity: stock ? stock.availableQuantity : 0,
                        minimumLevel: stock ? stock.minimumLevel : 0,
                    };
                });

                const initialQuantities = combined.reduce<Record<number, number>>((acc, product) => {
                    const suggestedQuantity = Math.max(
                        product.minimumLevel - product.availableQuantity,
                        1
                    );

                    acc[product.id] = Math.min(
                        suggestedQuantity,
                        product.stockQuantity
                    );

                    return acc;
                }, {});

                setProducts(combined);
                setQuantities(initialQuantities);
            } catch (error) {
                console.error("Errore caricamento catalogo POS:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchCatalog();
    }, []);

    function handleQuantityChange(productId: number, value: string) {
        const quantity = Number(value);

        setQuantities((prev) => ({
            ...prev,
            [productId]: quantity < 0 ? 0 : quantity,
        }));
    }

    async function sendPosNotification(productName: string) {
        try {
            const response = await fetch("http://localhost:8080/notifications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    targetRole: "POS",
                    title: "Richiesta di rifornimento inviata",
                    message: `La richiesta di rifornimento per ${productName} è stata inviata al magazzino centrale.`,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Errore notifica POS: ${response.status} ${text}`);
            }

            window.dispatchEvent(new Event("pos-notifications-updated"));
        } catch (error) {
            console.error("Errore creazione notifica POS:", error);
        }
    }

    async function handleCreateRequest(product: CombinedProduct) {
        const quantity = quantities[product.id] ?? 1;

        if (quantity <= 0) {
            alert("Inserisci una quantità valida.");
            return;
        }

        if (quantity > product.stockQuantity) {
            alert(
                `Quantità non disponibile. Disponibilità massima magazzino centrale: ${product.stockQuantity}`
            );
            return;
        }

        try {
            setSubmittingProductId(product.id);

            const response = await fetch(
                `http://localhost:8080/api/pos/replenishment?storeId=1&productId=${product.id}&quantity=${quantity}`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Errore invio richiesta: ${response.status} ${text}`);
            }

            await sendPosNotification(product.name);

            alert(`Richiesta inviata per ${product.name}`);
        } catch (error) {
            console.error("Errore invio richiesta rifornimento:", error);
            alert("Errore durante l'invio della richiesta");
        } finally {
            setSubmittingProductId(null);
        }
    }

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <header className="mb-8 mt-4 md:mt-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">
                        Prodotti
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Catalogo prodotti, giacenze del punto vendita e disponibilità del magazzino centrale.
                    </p>
                </div>

                <div className="relative w-full lg:w-[420px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cerca prodotto..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </header>

            {loading ? (
                <p className="text-gray-500 font-medium">
                    Caricamento prodotti...
                </p>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                        const isLowStock = product.availableQuantity <= product.minimumLevel;
                        const quantity = quantities[product.id] ?? 1;
                        const totalAmount = quantity * product.price;
                        const isSubmitting = submittingProductId === product.id;
                        const isQuantityTooHigh = quantity > product.stockQuantity;
                        const hasCentralStock = product.stockQuantity > 0;

                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                            >
                                <div className="h-64 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                                    {product.imageUrl ? (
                                        <img
                                            src={`/products/${product.imageUrl}`}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-8"
                                        />
                                    ) : (
                                        <Package className="w-16 h-16 text-gray-400" />
                                    )}
                                </div>

                                <div className="p-7 flex flex-col flex-1">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div>
                                            <h2 className="font-black text-gray-900 text-2xl leading-tight">
                                                {product.name}
                                            </h2>
                                            <p className="text-gray-500 font-medium mt-2">
                                                {product.category}
                                            </p>
                                        </div>

                                        {isLowStock ? (
                                            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-xs font-black shrink-0">
                                                Sotto soglia
                                            </span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black shrink-0">
                                                Disponibile
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs text-gray-500 font-bold mb-1">
                                                Giacenza punto vendita
                                            </p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {product.availableQuantity}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs text-gray-500 font-bold mb-1">
                                                Soglia limite
                                            </p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {product.minimumLevel}
                                            </p>
                                        </div>

                                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                                            <p className="text-xs text-blue-700 font-bold mb-1 flex items-center gap-1">
                                                <Warehouse className="w-4 h-4" />
                                                Magazzino centrale
                                            </p>
                                            <p className="text-2xl font-black text-blue-700">
                                                {product.stockQuantity}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs text-gray-500 font-bold mb-1">
                                                Barcode
                                            </p>
                                            <p className="text-sm font-bold text-gray-700">
                                                {product.barcode || "N/D"}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4 col-span-2">
                                            <p className="text-xs text-gray-500 font-bold mb-1">
                                                Prezzo
                                            </p>
                                            <p className="text-2xl font-black text-blue-600">
                                                €{product.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6 mt-auto">
                                        <label className="block text-center text-sm font-black text-gray-700 mb-3">
                                            Quantità da richiedere
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            max={product.stockQuantity}
                                            value={quantity}
                                            onChange={(event) =>
                                                handleQuantityChange(product.id, event.target.value)
                                            }
                                            className={`w-full border rounded-2xl p-4 text-center text-2xl font-black focus:ring-2 focus:outline-none ${
                                                isQuantityTooHigh
                                                    ? "border-red-300 text-red-700 focus:ring-red-300"
                                                    : "border-gray-200 focus:ring-blue-500"
                                            }`}
                                        />

                                        {isQuantityTooHigh && (
                                            <p className="text-sm text-red-600 font-bold text-center mt-2">
                                                Quantità massima disponibile: {product.stockQuantity}
                                            </p>
                                        )}

                                        {!hasCentralStock && (
                                            <p className="text-sm text-red-600 font-bold text-center mt-2">
                                                Nessuna disponibilità nel magazzino centrale.
                                            </p>
                                        )}

                                        <div className="text-center mt-5">
                                            <p className="text-xs text-gray-500 font-bold">
                                                Totale stimato
                                            </p>
                                            <p className="text-3xl font-black text-blue-600">
                                                €{totalAmount.toFixed(2)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleCreateRequest(product)}
                                            disabled={
                                                quantity <= 0 ||
                                                isQuantityTooHigh ||
                                                isSubmitting ||
                                                !hasCentralStock
                                            }
                                            className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-4 text-base font-black rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            {isSubmitting ? "Invio richiesta..." : "Invia richiesta"}
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