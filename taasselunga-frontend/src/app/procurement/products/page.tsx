"use client";

import { useState, useEffect } from 'react';
import BarcodeScanner from "../../../components/BarcodeScanner";

export default function ProcurementProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        imageUrl: '',
        barcode: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    initialStock: 0,
                    threshold: 10
                })
            });
            if (res.ok) {
                fetchProducts();
                setFormData({ name: '', category: '', price: '', imageUrl: '', barcode: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleScan = (scannedBarcode: string) => {
        setFormData({ ...formData, barcode: scannedBarcode });
        setIsScanning(false);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Gestione Prodotti - Approvvigionamento</h1>

            {isScanning && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setIsScanning(false)}
                />
            )}

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Aggiungi Nuovo Prodotto</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Nome Prodotto"
                        className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Categoria"
                        className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Prezzo (€)"
                        step="0.01"
                        className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                    <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="URL Immagine (opzionale)"
                        className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    />

                    <div className="flex gap-2 w-full md:col-span-2">
                        <input
                            type="text"
                            name="barcode"
                            value={formData.barcode}
                            onChange={handleInputChange}
                            placeholder="Lettura Barcode"
                            className="border border-gray-300 p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setIsScanning(true)}
                            className="bg-gray-800 text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-700 transition-colors whitespace-nowrap"
                        >
                            Usa Scanner
                        </button>
                    </div>

                    <div className="md:col-span-2 mt-2">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Salva Prodotto
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Lista Prodotti a Sistema</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-gray-100 border-b border-gray-300">
                            <th className="p-4 font-semibold">Nome</th>
                            <th className="p-4 font-semibold">Categoria</th>
                            <th className="p-4 font-semibold">Prezzo</th>
                            <th className="p-4 font-semibold">Codice a Barre</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((product, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium">{product.name}</td>
                                <td className="p-4">{product.category}</td>
                                <td className="p-4">€{parseFloat(product.price).toFixed(2)}</td>
                                <td className="p-4 font-mono text-sm text-gray-600">{product.barcode || 'N/A'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}