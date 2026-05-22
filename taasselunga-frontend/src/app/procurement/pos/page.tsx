"use client";
import React, { useState, useEffect } from 'react';

// Interfacce dei dati
interface Product { id: number; name: string; price: number; stockQuantity: number; }
interface Sale { id: number; totalAmount: number; saleDate: string; cashierName: string; productId: number; quantity: number; }

export default function PosPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Stato della cassa
    const [newSale, setNewSale] = useState({
        productId: 0,
        quantity: 1,
        cashierName: 'Cassa 1 (Davide)'
    });

    const fetchData = async () => {
        try {
            const [productsRes, salesRes] = await Promise.all([
                fetch('http://localhost:8080/api/inventory/products'),
                fetch('http://localhost:8080/api/pos/sales')
            ]);

            if (productsRes.ok) setProducts(await productsRes.json());
            if (salesRes.ok) setSales(await salesRes.json());
        } catch (err) {
            console.error("Errore nel caricamento:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Trova il prodotto selezionato per calcolare il totale in tempo reale
    const selectedProduct = products.find(p => p.id === newSale.productId);
    const currentTotal = selectedProduct ? selectedProduct.price * newSale.quantity : 0;

    // 2. Batti lo scontrino!
    const handleRegisterSale = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return alert("Seleziona un prodotto!");
        if (newSale.quantity > selectedProduct.stockQuantity) {
            return alert(`Attenzione! Ci sono solo ${selectedProduct.stockQuantity} pezzi in magazzino.`);
        }

        const salePayload = {
            ...newSale,
            totalAmount: currentTotal // Inviamo il totale calcolato
        };

        try {
            const response = await fetch('http://localhost:8084/api/pos/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(salePayload)
            });

            if (response.ok) {
                fetchData(); // Ricarica tutto per vedere le giacenze aggiornate
                setNewSale({ ...newSale, productId: 0, quantity: 1 }); // Resetta la cassa
                alert("Scontrino battuto con successo! Il magazzino è stato scalato.");
            } else {
                alert("Errore durante la vendita (magari la scorta è insufficiente).");
            }
        } catch (error) {
            console.error("Errore durante la registrazione", error);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">

            {/* COLONNA SINISTRA: REGISTRATORE DI CASSA */}
            <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sticky top-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-gray-800">Cassa</h2>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">POS Terminal</span>
                    </div>

                    <form onSubmit={handleRegisterSale} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Operatore</label>
                            <select value={newSale.cashierName} onChange={e => setNewSale({...newSale, cashierName: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 text-gray-700 font-medium">
                                <option value="Cassa 1 (Davide)">Cassa 1 (Davide)</option>
                                <option value="Cassa 2 (Alessia)">Cassa 2 (Alessia)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Prodotto Scansionato</label>
                            <select required value={newSale.productId} onChange={e => setNewSale({...newSale, productId: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium">
                                <option value={0} disabled>Seleziona prodotto...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Disp: {p.stockQuantity}) - €{p.price}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Quantità</label>
                            <input required type="number" min="1" value={newSale.quantity} onChange={e => setNewSale({...newSale, quantity: parseInt(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium" />
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-6">
                            <p className="text-sm font-bold text-gray-500 mb-1">Totale da pagare</p>
                            <p className="text-4xl font-black text-gray-900">€{currentTotal.toFixed(2)}</p>
                        </div>

                        <button type="submit" disabled={!selectedProduct} className="w-full bg-green-600 disabled:bg-gray-300 text-white p-4 font-black text-lg rounded-xl hover:bg-green-700 shadow-lg transition-colors">
                            Batti Scontrino
                        </button>
                    </form>
                </div>
            </div>

            {/* COLONNA DESTRA: STORICO VENDITE */}
            <div className="w-full lg:w-2/3">
                <h2 className="text-2xl font-black text-gray-800 mb-2">Storico Transazioni</h2>
                <p className="text-gray-500 font-medium mb-6">Elenco delle vendite registrate nel sistema.</p>

                {isLoading ? (
                    <p className="font-bold py-8 text-blue-600 animate-pulse">Caricamento sistema casse...</p>
                ) : (
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                <th className="p-5 font-bold">Transazione</th>
                                <th className="p-5 font-bold">Orario</th>
                                <th className="p-5 font-bold">Operatore</th>
                                <th className="p-5 font-bold text-right">Totale</th>
                            </tr>
                            </thead>
                            <tbody className="text-sm">
                            {sales.length === 0 && (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-medium">Nessuna vendita registrata oggi.</td></tr>
                            )}
                            {sales.slice().reverse().map((sale) => (
                                <tr key={sale.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                                    <td className="p-5 font-black text-gray-800">#{sale.id}</td>
                                    <td className="p-5 text-gray-500 font-medium">{new Date(sale.saleDate).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                    <td className="p-5 text-gray-700 font-medium">{sale.cashierName}</td>
                                    <td className="p-5 text-right font-black text-green-600 text-lg">€{sale.totalAmount.toFixed(2)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}