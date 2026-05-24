"use client";

import React, { useState, useEffect } from "react";
import BarcodeScanner from "../../../components/BarcodeScanner";
import { Package } from "lucide-react";

export default function ScannerPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Carichiamo i prodotti per poterli filtrare dopo la scansione
    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem("access_token");
            const res = await fetch("http://localhost:8080/api/inventory/products", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setProducts(data);
        };
        fetchProducts();
    }, []);

    const foundProduct = products.find(p => p.barcode === scannedBarcode);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-black mb-4">Scanner Barcode</h1>

            {!scannedBarcode ? (
                <div className="h-96">
                    <BarcodeScanner
                        onScan={(code) => setScannedBarcode(code)}
                        onClose={() => {}}
                    />
                </div>
            ) : (
                <div className="bg-white p-6 rounded-3xl border border-slate-200">
                    <h2 className="text-xl font-bold">Risultato scansione: {scannedBarcode}</h2>
                    {foundProduct ? (
                        <div className="mt-4 p-4 bg-green-50 rounded-xl">
                            <p className="font-bold text-green-800">Prodotto trovato: {foundProduct.name}</p>
                            <p>Giacenza: {foundProduct.stockQuantity}</p>
                        </div>
                    ) : (
                        <p className="mt-4 text-red-500">Nessun prodotto trovato con questo barcode.</p>
                    )}
                    <button
                        onClick={() => setScannedBarcode(null)}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        Scansiona di nuovo
                    </button>
                </div>
            )}
        </div>
    );
}