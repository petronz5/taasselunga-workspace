"use client";

import React, { useEffect, useMemo, useState } from "react";

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

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("access_token");

            const response = await fetch("http://localhost:8080/api/inventory/products", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Errore nel caricamento prodotti");
            }

            const data: Product[] = await response.json();
            setProducts(data);
        } catch (error) {
            console.error(error);
            alert("Errore nel caricamento dell'inventario");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            `${product.name} ${product.category} ${product.barcode ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [products, search]);

    const lowStockProducts = products.filter(
        (product) => product.stockQuantity < product.reorderThreshold
    );

    const selectedProduct = products.find((p) => p.id === selectedProductId);

    const handleReceiveGoods = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedProductId || quantity <= 0) {
            alert("Seleziona un prodotto e inserisci una quantità valida");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `http://localhost:8080/api/inventory/receive?productId=${selectedProductId}&quantity=${quantity}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Errore nella registrazione della merce");
            }

            alert("Merce registrata con successo");
            setSelectedProductId(null);
            setQuantity(1);
            await fetchProducts();
        } catch (error) {
            console.error(error);
            alert("Errore durante il carico merce");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <header className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <p className="text-sm font-bold text-blue-700 uppercase">
                        Magazzino Centrale
                    </p>
                    <h1 className="text-3xl font-black text-slate-900">
                        Gestione Inventory
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Visualizza giacenze, soglie minime e registra merce in arrivo.
                    </p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-semibold">Prodotti totali</p>
                        <p className="text-3xl font-black text-slate-900">{products.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-semibold">Sotto soglia</p>
                        <p className="text-3xl font-black text-orange-600">
                            {lowStockProducts.length}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                        <p className="text-slate-500 font-semibold">Pezzi totali</p>
                        <p className="text-3xl font-black text-green-700">
                            {products.reduce((sum, p) => sum + p.stockQuantity, 0)}
                        </p>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm lg:col-span-1">
                        <h2 className="text-xl font-black text-slate-900 mb-4">
                            Registra merce ricevuta
                        </h2>

                        <form onSubmit={handleReceiveGoods} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Prodotto
                                </label>

                                <select
                                    value={selectedProductId ?? ""}
                                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-200"
                                    required
                                >
                                    <option value="" disabled>
                                        Seleziona prodotto
                                    </option>

                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - Giacenza: {product.stockQuantity}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedProduct && (
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                    <p className="font-bold text-slate-800">{selectedProduct.name}</p>
                                    <p className="text-sm text-slate-500">
                                        Stock attuale: {selectedProduct.stockQuantity}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Soglia minima: {selectedProduct.reorderThreshold}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Quantità ricevuta
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="w-full border border-slate-300 rounded-xl p-3 text-xl font-black outline-none focus:ring-2 focus:ring-blue-200"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-700 disabled:bg-slate-300 text-white font-black rounded-xl p-4 hover:bg-blue-800 transition"
                            >
                                {submitting ? "Registrazione..." : "Registra carico"}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm lg:col-span-2">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                            <h2 className="text-xl font-black text-slate-900">
                                Giacenze prodotti
                            </h2>

                            <input
                                type="text"
                                placeholder="Cerca prodotto, categoria o barcode..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="border border-slate-300 rounded-xl p-3 w-full md:w-80 outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>

                        {loading ? (
                            <p className="text-slate-500 font-semibold">Caricamento...</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                                        <th className="py-3">Prodotto</th>
                                        <th className="py-3">Categoria</th>
                                        <th className="py-3">Giacenza</th>
                                        <th className="py-3">Soglia</th>
                                        <th className="py-3">Stato</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {filteredProducts.map((product) => {
                                        const isLow =
                                            product.stockQuantity < product.reorderThreshold;

                                        return (
                                            <tr
                                                key={product.id}
                                                className="border-b border-slate-100 hover:bg-slate-50"
                                            >
                                                <td className="py-4 font-bold text-slate-900">
                                                    {product.name}
                                                    {product.barcode && (
                                                        <p className="text-xs text-slate-400 font-medium">
                                                            Barcode: {product.barcode}
                                                        </p>
                                                    )}
                                                </td>

                                                <td className="py-4 text-slate-600">
                                                    {product.category}
                                                </td>

                                                <td className="py-4 font-black text-slate-900">
                                                    {product.stockQuantity}
                                                </td>

                                                <td className="py-4 text-slate-600">
                                                    {product.reorderThreshold}
                                                </td>

                                                <td className="py-4">
                                                    {isLow ? (
                                                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black">
                                Sotto soglia
                              </span>
                                                    ) : (
                                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                                Disponibile
                              </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}