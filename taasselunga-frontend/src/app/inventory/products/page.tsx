"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Package, Search } from "lucide-react";

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

export default function InventoryProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");

        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async function fetchProducts() {
        try {
            setLoading(true);

            const response = await fetch("http://localhost:8080/api/inventory/products?page=0&size=50", {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error("Errore caricamento prodotti");
            }

            const data = await response.json();

            const normalizedProducts: Product[] = Array.isArray(data)
                ? data
                : Array.isArray(data.content)
                    ? data.content
                    : [];

            setProducts(normalizedProducts);
        } catch (error) {
            console.error("Errore caricamento giacenze:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            `${product.name} ${product.category} ${product.barcode ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [products, search]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Giacenze
                </h1>

                <p className="text-slate-500 mt-2 font-medium">
                    Prodotti disponibili nel magazzino centrale.
                </p>
            </div>

            <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            Prodotti in magazzino
                        </h2>

                        <p className="text-sm text-slate-500 font-medium">
                            Ricerca per nome, categoria o barcode.
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />

                        <input
                            type="text"
                            placeholder="Cerca prodotto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-slate-300 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                        />
                    </div>
                </div>

                {loading ? (
                    <p className="text-slate-500 font-semibold">Caricamento giacenze...</p>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
                        <Package className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="font-black text-slate-700">Nessun prodotto trovato</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                            <tr className="border-b border-slate-200 text-sm text-slate-500">
                                <th className="py-3 pr-4">Prodotto</th>
                                <th className="py-3 pr-4">Categoria</th>
                                <th className="py-3 pr-4">Giacenza</th>
                                <th className="py-3 pr-4">Soglia</th>
                                <th className="py-3 pr-4">Prezzo</th>
                                <th className="py-3">Stato</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredProducts.map((product) => {
                                const isLow = product.stockQuantity < product.reorderThreshold;

                                return (
                                    <tr
                                        key={product.id}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                                    {product.imageBase64 ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${product.imageBase64}`}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain p-2"
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-slate-400" />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-black text-slate-900">
                                                        {product.name}
                                                    </p>

                                                    {product.barcode && (
                                                        <p className="text-xs text-slate-400 font-medium">
                                                            Barcode: {product.barcode}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 pr-4 text-slate-600">
                                            {product.category}
                                        </td>

                                        <td className="py-4 pr-4 font-black text-slate-900">
                                            {product.stockQuantity}
                                        </td>

                                        <td className="py-4 pr-4 text-slate-600">
                                            {product.reorderThreshold}
                                        </td>

                                        <td className="py-4 pr-4 font-bold text-slate-700">
                                            €{Number(product.price).toFixed(2)}
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
            </section>
        </div>
    );
}