"use client";
import React, { useState, useEffect } from 'react';

interface Supplier {
    id: number;
    name: string;
    contact: string;
    email: string;
    phone: string;
    reliability: number;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '', contact: '', email: '', phone: '', reliability: 100
    });

    const fetchSuppliers = async () => {
        try {
            // PASSAGGIO DAL GATEWAY: PORTA 8080
            const response = await fetch('http://localhost:8080/api/procurement/suppliers');
            if (response.ok) {
                const data = await response.json();
                setSuppliers(data);
            }
        } catch (err) {
            console.error("Errore nel caricamento fornitori:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleAddSupplier = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // PASSAGGIO DAL GATEWAY: PORTA 8080
            const response = await fetch('http://localhost:8080/api/procurement/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsModalOpen(false);
                fetchSuppliers();
                setFormData({ name: '', contact: '', email: '', phone: '', reliability: 100 });
            }
        } catch (error) {
            console.error("Errore durante il salvataggio", error);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-800">Anagrafica Fornitori</h2>
                    <p className="text-gray-500 font-medium mt-1">Rubrica e affidabilità dei partner commerciali.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-900 text-white px-4 py-2 font-bold rounded-lg hover:bg-blue-800 shadow-sm transition-colors"
                >
                    + Nuovo Fornitore
                </button>
            </div>

            {isLoading && <p className="text-center font-bold py-8">Caricamento fornitori in corso...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!isLoading && suppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl">
                                {supplier.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${supplier.reliability >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                Affidabilità: {supplier.reliability}%
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">{supplier.name}</h3>
                        <p className="text-sm text-gray-500 font-medium mb-4">Ref: {supplier.contact}</p>

                        <div className="space-y-2 mt-auto pt-4 border-t border-gray-100 text-sm">
                            <div className="flex items-center gap-2 text-gray-600"><span>✉️</span> <a href={`mailto:${supplier.email}`} className="hover:text-blue-600">{supplier.email}</a></div>
                            <div className="flex items-center gap-2 text-gray-600"><span>📞</span> <a href={`tel:${supplier.phone}`} className="hover:text-blue-600">{supplier.phone}</a></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODALE NUOVO FORNITORE: EFFETTO GLASSMORPHISM */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-800/40 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300">
                    <form onSubmit={handleAddSupplier} className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 translate-y-0">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Aggiungi Fornitore</h3>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ragione Sociale</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Es. Rossi SPA" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Persona di Contatto</label>
                                <input required type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Es. Mario Rossi" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="mario@rossi.it" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Telefono</label>
                                    <input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="+39..." />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Annulla</button>
                            <button type="submit" className="px-4 py-2 font-bold bg-blue-900 text-white hover:bg-blue-800 rounded-lg shadow-sm transition-colors">Salva Fornitore</button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}