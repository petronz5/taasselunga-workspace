"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Package } from "lucide-react";

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

interface StoreStock {
    stockId: number;
    storeId: number;
    productId: number;
    availableQuantity: number;
    minimumLevel: number;
}

interface PosProduct extends Product {
    storeQuantity: number;
    storeMinimumLevel: number;
}

export default function PosDashboardPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [storeStock, setStoreStock] = useState<StoreStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [draftQuantities, setDraftQuantities] = useState<Record<number, number>>({});
    const [submittingProductId, setSubmittingProductId] = useState<number | null>(null);

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

            const [productsResponse, storeStockResponse] = await Promise.all([
                fetch("http://localhost:8080/api/inventory/products?page=0&size=50", {
                    headers: getAuthHeaders(),
                }),
                fetch("http://localhost:8080/api/pos/store-stock/1", {
                    headers: getAuthHeaders(),
                }),
            ]);

            if (!productsResponse.ok) {
                throw new Error("Errore caricamento prodotti");
            }

            if (!storeStockResponse.ok) {
                throw new Error("Errore caricamento stock punto vendita");
            }

            const productsData = await productsResponse.json();
            const storeStockData = await storeStockResponse.json();

            const normalizedProducts: Product[] = Array.isArray(productsData)
                ? productsData
                : Array.isArray(productsData.content)
                    ? productsData.content
                    : [];

            const normalizedStoreStock: StoreStock[] = Array.isArray(storeStockData)
                ? storeStockData
                : Array.isArray(storeStockData.content)
                    ? storeStockData.content
                    : [];

            setProducts(normalizedProducts);
            setStoreStock(normalizedStoreStock);

            const initialDrafts = normalizedStoreStock.reduce<Record<number, number>>(
                (acc, stock) => {
                    if (stock.availableQuantity < stock.minimumLevel) {
                        acc[stock.productId] =
                            stock.minimumLevel - stock.availableQuantity + 10;
                    }

                    return acc;
                },
                {}
            );

            setDraftQuantities(initialDrafts);
        } catch (error) {
            console.error("Errore caricamento dashboard POS:", error);
            setProducts([]);
            setStoreStock([]);
        } finally {
            setLoading(false);
        }
    }

    function findProduct(productId: number) {
        return products.find((product) => product.id === productId);
    }

    const lowStoreProducts = useMemo(() => {
        return storeStock
            .filter((stock) => stock.availableQuantity < stock.minimumLevel)
            .map((stock) => {
                const product = findProduct(stock.productId);

                if (!product) {
                    return null;
                }

                return {
                    ...product,
                    storeQuantity: stock.availableQuantity,
                    storeMinimumLevel: stock.minimumLevel,
                };
            })
            .filter(Boolean) as PosProduct[];
    }, [storeStock, products]);

    function handleQuantityChange(productId: number, value: string) {
        const quantity = Number(value);

        setDraftQuantities((prev) => ({
            ...prev,
            [productId]: quantity < 0 ? 0 : quantity,
        }));
    }

    async function handleSendRequest(product: PosProduct) {
        const quantity = draftQuantities[product.id] ?? 1;

        if (quantity <= 0) {
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
                throw new Error("Errore invio richiesta");
            }

            alert(`Richiesta inviata per ${product.name}`);

            await loadData();
        } catch (error) {
            console.error("Errore invio richiesta POS:", error);
            alert("Errore durante l'invio della richiesta");
        } finally {
            setSubmittingProductId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Benvenuto Luigi
                </h1>

                <p className="text-slate-500 mt-2 font-medium">
                    Responsabile Punto Vendita TAASSELUNGA di Via Po, Torino
                </p>
            </div>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black text-slate-900">
                            Prodotti da rifornire
                        </h2>

                        <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">
                            {lowStoreProducts.length} prodotti
                        </span>
                    </div>

                    {loading ? (
                        <p className="text-slate-500 font-semibold">
                            Caricamento prodotti...
                        </p>
                    ) : lowStoreProducts.length === 0 ? (
                        <div className="bg-orange-100 border text-orange-700 rounded-2xl p-8 text-center">
                            <p className="font-black text-orange-700">
                                Nessun prodotto da riordinare
                            </p>

                            <p className="text-sm text-orange-700 mt-1">
                                Al momento non ci sono prodotti sotto soglia nel punto vendita.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lowStoreProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border border-orange-100 bg-orange-50 rounded-2xl p-4 flex items-center gap-4"
                                >
                                    <div className="w-16 h-16 bg-white border border-orange-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                        {product.imageUrl ? (
                                            <img
                                                src={`/products/${product.imageUrl}`}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <Package className="w-7 h-7 text-orange-500" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-black text-slate-900">
                                            {product.name}
                                        </p>

                                        <p className="text-xs text-slate-500 font-medium">
                                            {product.category}
                                        </p>

                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="font-bold text-red-600">
                                                Disponibili negozio: {product.storeQuantity}
                                            </span>

                                            <span className="text-slate-500">
                                                Soglia: {product.storeMinimumLevel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black text-slate-900">
                            Bozze richieste rifornimento
                        </h2>

                        <ClipboardList className="w-6 h-6 text-blue-600" />
                    </div>

                    {loading ? (
                        <p className="text-slate-500 font-semibold">
                            Generazione bozze...
                        </p>
                    ) : lowStoreProducts.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
                            <p className="font-black text-slate-700">
                                Nessuna richiesta suggerita
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                                Tutti i prodotti risultano disponibili nel punto vendita.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lowStoreProducts.map((product) => {
                                const quantity = draftQuantities[product.id] ?? 1;
                                const isSubmitting = submittingProductId === product.id;

                                return (
                                    <div
                                        key={product.id}
                                        className="border border-blue-100 bg-blue-50 rounded-2xl p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-white border border-blue-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={`/products/${product.imageUrl}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <Package className="w-7 h-7 text-blue-500" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-black text-slate-900">
                                                    Richiesta suggerita - {product.name}
                                                </p>

                                                <p className="text-sm text-slate-500 mt-1">
                                                    Disponibili negozio: {product.storeQuantity} / Soglia:{" "}
                                                    {product.storeMinimumLevel}
                                                </p>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-bold">
                                                            Quantità richiesta
                                                        </p>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={quantity}
                                                            onChange={(event) =>
                                                                handleQuantityChange(
                                                                    product.id,
                                                                    event.target.value
                                                                )
                                                            }
                                                            className="w-28 border border-blue-200 rounded-xl px-3 py-2 text-xl font-black text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={() => handleSendRequest(product)}
                                                        disabled={isSubmitting || quantity <= 0}
                                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-3 rounded-xl text-sm font-black transition"
                                                    >
                                                        {isSubmitting ? "Invio..." : "Invia richiesta"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}