"use client";

import React, { useEffect, useState } from "react";
import { Package } from "lucide-react";

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
}

interface CombinedProduct extends Product {
    availableQuantity: number;
    minimumLevel: number;
}

export default function PosProductsPage() {
    const [products, setProducts] = useState<CombinedProduct[]>([]);
    const [loading, setLoading] = useState(true);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");
        return { Authorization: `Bearer ${token}` };
    }

    useEffect(() => {
        async function fetchCatalog() {
            try {
                const [productsRes, stockRes] = await Promise.all([
                    fetch("http://localhost:8080/api/inventory/products?page=0&size=50", { headers: getAuthHeaders() }),
                    fetch("http://localhost:8080/api/pos/store-stock/1", { headers: getAuthHeaders() })
                ]);

                const productsData = await productsRes.json();
                const stockData = await stockRes.json();

                const normalizedProducts: Product[] = Array.isArray(productsData) ? productsData : productsData.content || [];
                const normalizedStock: StoreStock[] = Array.isArray(stockData) ? stockData : stockData.content || [];

                const combined = normalizedProducts.map(p => {
                    const stock = normalizedStock.find(s => s.productId === p.id);
                    return {
                        ...p,
                        availableQuantity: stock ? stock.availableQuantity : 0,
                        minimumLevel: stock ? stock.minimumLevel : 0
                    };
                });

                setProducts(combined);
            } catch (error) {
                console.error("Failed to load catalog", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCatalog();
    }, []);

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" /> Product Catalog & Stock
            </h1>

            {loading ? (
                <p className="text-slate-500">Loading catalog...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-sm">
                            <th className="pb-3 font-bold">Product ID</th>
                            <th className="pb-3 font-bold">Name</th>
                            <th className="pb-3 font-bold">Category</th>
                            <th className="pb-3 font-bold">Price</th>
                            <th className="pb-3 font-bold">Store Stock</th>
                            <th className="pb-3 font-bold">Min Threshold</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="py-4 font-medium text-slate-600">#{p.id}</td>
                                <td className="py-4 font-black text-slate-900">{p.name}</td>
                                <td className="py-4 text-slate-500">{p.category}</td>
                                <td className="py-4 font-bold text-blue-600">€{p.price.toFixed(2)}</td>
                                <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${p.availableQuantity <= p.minimumLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {p.availableQuantity}
                                        </span>
                                </td>
                                <td className="py-4 text-slate-500 font-medium">{p.minimumLevel}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}