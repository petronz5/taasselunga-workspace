"use client";

import React, { useState, useEffect } from "react";
import BarcodeScanner from "../../../components/BarcodeScanner";
import { useRouter } from "next/navigation";
import { Package, ArrowLeft, CheckCircle, XCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ScannerPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("access_token");
                const res = await fetch(`${API_BASE_URL}/api/inventory/products?page=0&size=50`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Errore di rete");

                const data = await res.json();
                setProducts(Array.isArray(data) ? data : data.content || []);
            } catch (error) {
                console.error("Errore caricamento prodotti:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const foundProduct = products.find(p => p.barcode === scannedBarcode);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/inventory")}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Scanner Magazzino</h1>
                    <p className="text-gray-500 font-medium mt-1">Acquisisci il codice a barre per interrogare il database.</p>
                </div>
            </div>

            {!scannedBarcode ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
                    <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Pronto per la scansione</h2>
                    <p className="text-gray-500 mb-8">Avvia la fotocamera per leggere un codice a barre o QR code.</p>

                    <button
                        onClick={() => setScannedBarcode("avvia_scanner")} // Trigger temporaneo per aprire il modal
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-sm"
                    >
                        Accendi Fotocamera
                    </button>
                </div>
            ) : scannedBarcode === "avvia_scanner" ? (
                <BarcodeScanner
                    onScan={(code) => setScannedBarcode(code)}
                    onClose={() => setScannedBarcode(null)}
                />
            ) : (
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm animate-in zoom-in-95">
                    <div className="mb-8">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Codice Rilevato</span>
                        <p className="text-2xl font-mono font-black text-gray-900 mt-1">{scannedBarcode}</p>
                    </div>

                    {foundProduct ? (
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-green-900">{foundProduct.name}</h3>
                                    <p className="text-green-700 font-medium mb-4">{foundProduct.category}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-xl p-3 shadow-sm border border-green-100">
                                            <span className="block text-xs font-bold text-gray-500">Giacenza</span>
                                            <span className="text-lg font-black text-gray-900">{foundProduct.stockQuantity}</span>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 shadow-sm border border-green-100">
                                            <span className="block text-xs font-bold text-gray-500">Soglia Minima</span>
                                            <span className="text-lg font-black text-gray-900">{foundProduct.reorderThreshold}</span>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 shadow-sm border border-green-100">
                                            <span className="block text-xs font-bold text-gray-500">Prezzo Listino</span>
                                            <span className="text-lg font-black text-blue-600">€{foundProduct.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
                            <XCircle className="w-8 h-8 text-red-600 shrink-0" />
                            <div>
                                <h3 className="text-xl font-black text-red-900">Prodotto non trovato</h3>
                                <p className="text-red-700 font-medium">Il codice a barre non corrisponde a nessun articolo registrato a sistema.</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => setScannedBarcode(null)}
                        className="mt-8 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold transition w-full md:w-auto"
                    >
                        Effettua un'altra scansione
                    </button>
                </div>
            )}
        </div>
    );
}