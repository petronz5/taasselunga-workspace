"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Package, Warehouse } from "lucide-react";
import AlertModal from "../../components/AlertModal";

interface Product {
    id: number;
    name: string;
    category: string;
    stockQuantity: number;
    reorderThreshold: number;
    price: number;
    imageBase64?: string;
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
    const [sentDraftProductIds, setSentDraftProductIds] = useState<number[]>([]);

    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    const closeModal = () =>
        setModal((prev) => ({ ...prev, isOpen: false }));

    useEffect(() => {
        loadData(true);

        const interval = setInterval(() => {
            loadData(false);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async function loadData(showLoader = true) {
        try {
            if (showLoader) {
                setLoading(true);
            }

            const [productsResponse, storeStockResponse] = await Promise.all([
                fetch("http://localhost:8080/api/pos/products", {
                    headers: getAuthHeaders(),
                }),
                fetch("http://localhost:8080/api/pos/store-stock/1", {
                    headers: getAuthHeaders(),
                }),
            ]);

            if (!productsResponse.ok) {
                const text = await productsResponse.text();
                throw new Error(`Errore caricamento prodotti: ${productsResponse.status} ${text}`);
            }

            if (!storeStockResponse.ok) {
                const text = await storeStockResponse.text();
                throw new Error(`Errore caricamento stock negozio: ${storeStockResponse.status} ${text}`);
            }

            const productsData = await productsResponse.json();
            const storeStockData = await storeStockResponse.json();

            const normalizedProducts: Product[] = Array.isArray(productsData)
                ? productsData
                : productsData.content || [];

            const normalizedStoreStock: StoreStock[] = Array.isArray(storeStockData)
                ? storeStockData
                : storeStockData.content || [];

            setProducts(normalizedProducts);
            setStoreStock(normalizedStoreStock);

            setSentDraftProductIds((prev) =>
                prev.filter((productId) => {
                    const stock = normalizedStoreStock.find(
                        (s) => s.productId === productId
                    );

                    return stock && stock.availableQuantity < stock.minimumLevel;
                })
            );

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

            setDraftQuantities((prev) => ({
                ...initialDrafts,
                ...prev,
            }));
        } catch (error) {
            console.error("Errore caricamento dashboard POS:", error);
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    }

    const lowStockProducts = useMemo(() => {
        return storeStock
            .filter((stock) => stock.availableQuantity < stock.minimumLevel)
            .map((stock) => {
                const product = products.find((p) => p.id === stock.productId);

                if (!product) return null;

                return {
                    ...product,
                    storeQuantity: stock.availableQuantity,
                    storeMinimumLevel: stock.minimumLevel,
                };
            })
            .filter(Boolean) as PosProduct[];
    }, [storeStock, products]);

    const draftProducts = useMemo(() => {
        return lowStockProducts.filter(
            (product) => !sentDraftProductIds.includes(product.id)
        );
    }, [lowStockProducts, sentDraftProductIds]);

    function handleQuantityChange(productId: number, value: string) {
        const quantity = Number(value);

        setDraftQuantities((prev) => ({
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

                throw new Error(
                    `Errore notifica POS: ${response.status} ${text}`
                );
            }

            console.log("Notifica POS creata con successo");

            window.dispatchEvent(new Event("pos-notifications-updated"));
        } catch (error) {
            console.error("Errore creazione notifica POS:", error);
        }
    }

    async function handleSendRequest(product: PosProduct) {
        const quantity = draftQuantities[product.id] ?? 1;

        if (quantity <= 0) {
            setModal({
                isOpen: true,
                title: "Quantità non valida",
                message: "Inserisci una quantità valida.",
                type: "info",
            });

            return;
        }

        if (quantity > product.stockQuantity) {
            setModal({
                isOpen: true,
                title: "Quantità non disponibile",
                message: `Disponibilità massima magazzino centrale: ${product.stockQuantity}`,
                type: "error",
            });

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

            setSentDraftProductIds((prev) =>
                prev.includes(product.id) ? prev : [...prev, product.id]
            );

            setModal({
                isOpen: true,
                title: "Richiesta inviata",
                message: `Richiesta inviata con successo per ${product.name}.`,
                type: "success",
            });

            await loadData(false);

        } catch (error) {
            console.error("Errore richiesta rifornimento:", error);

            setModal({
                isOpen: true,
                title: "Errore invio",
                message: "Errore durante l'invio della richiesta.",
                type: "error",
            });

        } finally {
            setSubmittingProductId(null);
        }
    }

    return (
        <div className="space-y-6">
            <AlertModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Benvenuto Luigi
                </h1>

                <p className="text-slate-500 mt-2 font-medium">
                    Responsabile Punto Vendita - TAASSELUNGA Via Po, Torino
                </p>
            </div>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-black text-slate-900">
                            Prodotti da rifornire
                        </h2>

                        <span className="bg-slate-100 text-slate-700 text-xs font-black px-3 py-1 rounded-full">
                            {lowStockProducts.length} prodotti
                        </span>
                    </div>

                    {loading ? (
                        <p className="text-slate-500 font-semibold">
                            Caricamento prodotti...
                        </p>
                    ) : lowStockProducts.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
                            <p className="font-black text-slate-700">
                                Nessun prodotto da riordinare
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                                Tutti i prodotti del punto vendita sono sopra la soglia minima.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lowStockProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border border-slate-200 bg-white rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-50 transition"
                                >
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                        {product.imageBase64 ? (
                                            <img
                                                src={`data:image/jpeg;base64,${product.imageBase64}`}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <Package className="w-7 h-7 text-slate-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-black text-slate-900 truncate">
                                                    {product.name}
                                                </p>

                                                <p className="text-xs text-slate-500 font-medium">
                                                    {product.category}
                                                </p>
                                            </div>

                                            <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full shrink-0">
                                                Sotto soglia
                                            </span>
                                        </div>

                                        <div className="mt-3 space-y-2 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3">
                                                    <p className="text-xs text-orange-700 font-bold">
                                                        Giacenza negozio
                                                    </p>
                                                    <p className="font-black text-orange-700">
                                                        {product.storeQuantity}
                                                    </p>
                                                </div>

                                                <div className="flex-1 bg-orange-50 border border-orange-100 rounded-xl p-3">
                                                    <p className="text-xs text-orange-700 font-bold">
                                                        Soglia minima
                                                    </p>
                                                    <p className="font-black text-orange-700">
                                                        {product.storeMinimumLevel}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                                                <p className="text-xs text-slate-500 font-bold">
                                                    Magazzino centrale
                                                </p>
                                                <p className="font-black text-blue-700 inline-flex items-center gap-1">
                                                    <Warehouse className="w-4 h-4" />
                                                    {product.stockQuantity}
                                                </p>
                                            </div>
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
                            Bozze richieste di rifornimento
                        </h2>

                        <span className="bg-slate-100 text-slate-700 text-xs font-black px-3 py-1 rounded-full">
                            {draftProducts.length} da inviare
                        </span>
                    </div>

                    {loading ? (
                        <p className="text-slate-500 font-semibold">
                            Generazione bozze in corso...
                        </p>
                    ) : draftProducts.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center">
                            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />

                            <p className="font-black text-slate-700">
                                Nessuna bozza da inviare
                            </p>

                            <p className="text-sm text-slate-500 mt-1">
                                Le richieste già inviate sono state rimosse dalle bozze.
                                I prodotti sotto soglia resteranno visibili finché lo stock non verrà rifornito.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {draftProducts.map((product) => {
                                const quantity = draftQuantities[product.id] ?? 1;
                                const isSubmitting = submittingProductId === product.id;
                                const isQuantityTooHigh = quantity > product.stockQuantity;

                                return (
                                    <div
                                        key={product.id}
                                        className="border border-slate-200 bg-white rounded-2xl p-4 hover:bg-slate-50 transition"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                                {product.imageBase64 ? (
                                                    <img
                                                        src={`data:image/jpeg;base64,${product.imageBase64}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                ) : (
                                                    <Package className="w-7 h-7 text-slate-400" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">

                                                <div className="flex items-start justify-between gap-3">

                                                    <div>
                                                        <p className="font-black text-slate-900">
                                                            {product.name}
                                                        </p>

                                                        <p className="text-sm text-slate-500 mt-1">
                                                            Giacenza negozio: {product.storeQuantity} / Soglia minima: {product.storeMinimumLevel}
                                                        </p>
                                                    </div>

                                                    <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full shrink-0">
                                                        Bozza
                                                    </span>

                                                </div>

                                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-3">
                                                    <p className="text-xs text-slate-500 font-bold">
                                                        Magazzino centrale
                                                    </p>

                                                    <p className="font-black text-blue-700 inline-flex items-center gap-1">
                                                        <Warehouse className="w-4 h-4" />
                                                        {product.stockQuantity}
                                                    </p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between gap-4">

                                                    <div>
                                                        <p className="text-xs text-slate-500 font-bold">
                                                            Quantità richiesta
                                                        </p>

                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={product.stockQuantity}
                                                            value={quantity}
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    product.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className={`w-28 border rounded-xl px-3 py-2 text-xl font-black focus:outline-none focus:ring-2 ${
                                                                isQuantityTooHigh
                                                                    ? "border-red-300 text-red-700 focus:ring-red-300"
                                                                    : "border-slate-200 text-slate-900 focus:ring-blue-300"
                                                            }`}
                                                        />

                                                        {isQuantityTooHigh && (
                                                            <p className="text-xs text-red-600 font-bold mt-1">
                                                                Max: {product.stockQuantity}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => handleSendRequest(product)}
                                                        disabled={
                                                            isSubmitting ||
                                                            quantity <= 0 ||
                                                            isQuantityTooHigh
                                                        }
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