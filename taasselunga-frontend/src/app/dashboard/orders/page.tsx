"use client";
import React, { useState, useEffect } from 'react';

interface PurchaseOrder {
    id: number;
    orderNumber: string;
    orderDate: string;
    supplierName: string;
    totalAmount: number;
    status: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        orderNumber: '', supplierName: '', totalAmount: 0, status: 'IN_ATTESA'
    });

    const fetchOrders = async () => {
        try {
            // PASSAGGIO DAL GATEWAY: PORTA 8080
            const response = await fetch('http://localhost:8080/api/procurement/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (err) {
            console.error("Errore nel caricamento ordini:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAddOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        const finalOrderNumber = formData.orderNumber || `ORD-${Math.floor(Math.random() * 10000)}`;

        try {
            // PASSAGGIO DAL GATEWAY: PORTA 8080
            const response = await fetch('http://localhost:8080/api/procurement/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, orderNumber: finalOrderNumber })
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchOrders();
                setFormData({ orderNumber: '', supplierName: '', totalAmount: 0, status: 'IN_ATTESA' });
            }
        } catch (error) {
            console.error("Errore durante il salvataggio", error);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800">Ordini di Acquisto</h2>
                    <p className="text-gray-500 font-medium mt-1">Gestisci i rifornimenti dai fornitori.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-900 text-white px-4 py-2 font-bold rounded-lg hover:bg-blue-800 shadow-sm transition-colors"
                >
                    + Nuovo Ordine
                </button>
            </div>

            {isLoading && <p className="text-center font-bold py-8">Caricamento ordini in corso...</p>}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                            <th className="p-4 font-bold">N° Ordine</th>
                            <th className="p-4 font-bold">Data</th>
                            <th className="p-4 font-bold">Fornitore</th>
                            <th className="p-4 font-bold text-right">Totale (€)</th>
                            <th className="p-4 font-bold text-center">Stato</th>
                        </tr>
                        </thead>
                        <tbody className="text-sm">
                        {!isLoading && orders.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Nessun ordine presente. Creane uno nuovo!</td>
                            </tr>
                        )}
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-blue-900">{order.orderNumber}</td>
                                <td className="p-4 text-gray-600">{order.orderDate}</td>
                                <td className="p-4 font-medium text-gray-800">{order.supplierName}</td>
                                <td className="p-4 text-right font-black text-gray-800">€{order.totalAmount.toFixed(2)}</td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'CONSEGNATO' ? 'bg-green-100 text-green-700' :
                                            order.status === 'IN_ATTESA' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                    }`}>
                                      {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODALE NUOVO ORDINE: EFFETTO GLASSMORPHISM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300">
                    <form onSubmit={handleAddOrder} className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 translate-y-0">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Nuovo Ordine</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Fornitore</label>
                                <input required type="text" value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Es. Latterie Riunite SPA" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Importo Totale (€)</label>
                                    <input required type="number" step="0.01" value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: parseFloat(e.target.value)})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Stato</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                        <option value="IN_ATTESA">In Attesa</option>
                                        <option value="SPEDITO">Spedito</option>
                                        <option value="CONSEGNATO">Consegnato</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Annulla</button>
                            <button type="submit" className="px-4 py-2 font-bold bg-blue-900 text-white hover:bg-blue-800 rounded-lg shadow-sm transition-colors">Salva Ordine</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}