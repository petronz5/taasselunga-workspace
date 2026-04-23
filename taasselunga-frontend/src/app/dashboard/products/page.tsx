"use client";
import React, { useState, useEffect } from 'react';

interface Product {
    id: number; name: string; category: string;
    stockQuantity: number; reorderThreshold: number;
    price: number; imageUrl: string;
}

export default function ProductsPage() {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', category: '', price: 0, imageUrl: '', initialStock: 0, threshold: 0
    });

    const fetchProducts = async () => {
        try {
            // PASSAGGIO DAL GATEWAY: PORTA 8080
            const response = await fetch('http://localhost:8080/api/inventory/products');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // PASSAGGIO DAL GATEWAY: PORTA 8080
            const response = await fetch('http://localhost:8080/api/inventory/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchProducts();
                setFormData({ name: '', category: '', price: 0, imageUrl: '', initialStock: 0, threshold: 0 });
            }
        } catch (error) {
            console.error("Errore durante il salvataggio", error);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800">Catalogo Prodotti</h2>
                    <p className="text-gray-500 font-medium mt-1">Gestisci l'inventario e le scorte.</p>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text" placeholder="Cerca prodotto..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-900 text-white px-4 py-2 font-bold rounded-lg hover:bg-blue-800 whitespace-nowrap"
                    >
                        + Nuovo Prodotto
                    </button>
                </div>
            </div>

            {isLoading && <p className="text-center font-bold">Caricamento...</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="h-48 overflow-hidden bg-gray-100 relative">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase">{product.category}</span>
                            <h3 className="text-lg font-bold text-gray-800 mb-3">{product.name}</h3>
                            <div className="mt-auto">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Giacenza:</span>
                                    <span className="font-bold">{product.stockQuantity} pz</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                                    <span className="font-black text-blue-900">€{product.price.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE AGGIUNTA PRODOTTO: EFFETTO GLASSMORPHISM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300">
                    <form onSubmit={handleAddProduct} className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 translate-y-0">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Aggiungi Prodotto</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div><label className="block text-sm font-bold mb-1">Nome</label><input required type="text" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-lg" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold mb-1">Categoria</label><input required type="text" onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded-lg" /></div>
                                <div><label className="block text-sm font-bold mb-1">Prezzo (€)</label><input required type="number" step="0.01" onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full border p-2 rounded-lg" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold mb-1">Giacenza Iniziale</label><input required type="number" onChange={e => setFormData({...formData, initialStock: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg" /></div>
                                <div><label className="block text-sm font-bold mb-1">Soglia Avviso</label><input required type="number" onChange={e => setFormData({...formData, threshold: parseInt(e.target.value)})} className="w-full border p-2 rounded-lg" /></div>
                            </div>
                            <div><label className="block text-sm font-bold mb-1">Link Immagine (URL)</label><input required type="text" onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2 rounded-lg" placeholder="https://..." /></div>
                        </div>

                        <div className="p-6 bg-gray-50 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold bg-gray-200 rounded-lg">Annulla</button>
                            <button type="submit" className="px-4 py-2 font-bold bg-blue-900 text-white rounded-lg">Salva Prodotto</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}