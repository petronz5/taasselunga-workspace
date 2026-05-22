"use client";

import React, { useState, useEffect } from 'react';

interface Product {
    id: number;
    name: string;
    stockQuantity: number;
}

export default function WarehousePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(0);

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/inventory/products');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleReceiveGoods = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || quantity <= 0) return;

        try {
            const response = await fetch(`http://localhost:8080/api/inventory/receive?productId=${selectedProduct}&quantity=${quantity}`, {
                method: 'POST',
            });

            if (response.ok) {
                fetchProducts();
                setSelectedProduct(null);
                setQuantity(0);
                alert('Merce caricata con successo!');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <header className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Terminale Magazzino</h1>
                        <p className="text-slate-500 font-medium">Operatore: Antonio</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg text-3xl">
                        📦
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-10">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">Carico Merci in Arrivo</h2>

                    <form onSubmit={handleReceiveGoods} className="space-y-8">
                        <div>
                            <label className="block text-lg font-bold text-slate-700 mb-3">Seleziona Prodotto Ricevuto</label>
                            <select
                                required
                                value={selectedProduct || ''}
                                onChange={(e) => setSelectedProduct(Number(e.target.value))}
                                className="w-full border-2 border-slate-200 rounded-2xl p-4 text-lg font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
                            >
                                <option value="" disabled>Tocca per selezionare...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} (Giacenza attuale: {p.stockQuantity})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-lg font-bold text-slate-700 mb-3">Quantità Ricevuta (Pezzi)</label>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setQuantity(Math.max(0, quantity - 10))} className="w-20 h-20 rounded-2xl bg-slate-100 hover:bg-slate-200 text-4xl font-black text-slate-600 transition-colors">-</button>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={quantity || ''}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="flex-1 border-2 border-slate-200 rounded-2xl p-4 text-center text-4xl font-black text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none h-20"
                                />
                                <button type="button" onClick={() => setQuantity(quantity + 10)} className="w-20 h-20 rounded-2xl bg-slate-100 hover:bg-slate-200 text-4xl font-black text-slate-600 transition-colors">+</button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedProduct || quantity <= 0}
                            className="w-full bg-blue-600 disabled:bg-slate-300 disabled:shadow-none text-white p-6 font-black text-2xl rounded-2xl hover:bg-blue-700 shadow-xl transition-all active:scale-[0.98]"
                        >
                            Registra Carico nel Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}