"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Package,
    Search,
    ShoppingCart,
    Plus,
    X,
} from "lucide-react";

import BarcodeScanner from "../../../components/BarcodeScanner";
import Paginator from "../../../components/Paginator";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type Product = {
    id: number;
    name: string;
    category: string;
    stockQuantity: number;
    reorderThreshold: number;
    price: number;
    imageUrl?: string;
    barcode?: string;
};

export default function ProcurementProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [isScanning, setIsScanning] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info" as "success" | "error" | "info" });
    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const [orderQuantities, setOrderQuantities] = useState<
        Record<number, number>
    >({});

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        imageUrl: "",
        barcode: "",
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts(page = 0) {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                `http://localhost:8080/api/inventory/products?page=${page}&size=9`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error("Errore caricamento prodotti");

            const data = await response.json();

            setProducts(data.content);       // ← era: setProducts(data)
            setTotalPages(data.totalPages);
            setCurrentPage(data.number);

            const initialQuantities = data.content.reduce(  // ← era: data.reduce
                (acc: Record<number, number>, product: Product) => {
                    acc[product.id] = Math.max(
                        product.reorderThreshold - product.stockQuantity, 1
                    );
                    return acc;
                }, {}
            );
            setOrderQuantities(initialQuantities);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }

    const filteredProducts = useMemo(() => {
        return products.filter((product) =>
            `${product.name} ${product.category} ${
                product.barcode ?? ""
            }`
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [products, search]);

    function updateQuantity(productId: number, quantity: number) {
        setOrderQuantities((prev) => ({
            ...prev,
            [productId]: quantity < 1 ? 1 : quantity,
        }));
    }

    function handleInputChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    function handleScan(scannedBarcode: string) {
        setFormData({
            ...formData,
            barcode: scannedBarcode,
        });

        setIsScanning(false);
    }

    async function handleCreateProduct(
        e: React.FormEvent
    ) {
        e.preventDefault();

        try {
            const token = localStorage.getItem("access_token");

            const response = await fetch(
                "http://localhost:8080/api/inventory/products",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...formData,
                        price: parseFloat(formData.price),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Errore creazione prodotto");
            }

            await fetchProducts();

            setFormData({
                name: "",
                category: "",
                price: "",
                imageUrl: "",
                barcode: "",
            });

            setShowForm(false);

            setModal({ isOpen: true, title: "Prodotto Creato", message: "Il prodotto è stato inserito con successo nel catalogo", type: "success" });
        } catch (error) {
            console.error(error);
            setModal({ isOpen: true, title: "Errore Creazione", message: "Impossibile creare il prodotto, riprova più tardi", type: "error" });
        }
    }

    async function createOrder(product: Product) {
        try {
            const token = localStorage.getItem("access_token");

            const quantity =
                orderQuantities[product.id] ?? 1;

            const response = await fetch(
                "http://localhost:8080/api/procurement/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderNumber: `ORD-${Date.now()}`,
                        supplierName:
                            "Fornitore da assegnare",
                        totalAmount:
                            quantity * product.price,
                        status: "CREATO",
                        productId: product.id,
                        productName: product.name,
                        quantity,
                        unitPrice: product.price,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Errore creazione ordine");
            }

            alert(
                `Ordine creato per ${product.name}`
            );
        } catch (error) {
            console.error(error);
            setModal({ isOpen: true, title: "Errore Ordine", message: "Si è verificato un errore durante l'invio dell'ordine", type: "error" });
        }
    }

    return (
        <div className="space-y-6">
            {isScanning && (
                <BarcodeScanner
                    onScan={handleScan}
                    onClose={() => setIsScanning(false)}
                />
            )}

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">
                        Prodotti
                    </h1>

                    <p className="text-gray-500 mt-1 font-medium">
                        Gestione completa catalogo
                        prodotti.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-96">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />

                        <input
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Cerca prodotto..."
                            className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                        />
                    </div>

                    <button
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                        className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-black hover:bg-blue-700 transition inline-flex items-center gap-2 whitespace-nowrap"
                    >
                        {showForm ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}

                        {showForm
                            ? "Chiudi"
                            : "Nuovo prodotto"}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="text-2xl font-black text-gray-900 mb-5">
                        Aggiungi nuovo prodotto
                    </h2>

                    <form
                        onSubmit={handleCreateProduct}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nome prodotto"
                            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />

                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            placeholder="Categoria"
                            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />

                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="Prezzo"
                            step="0.01"
                            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                            required
                        />

                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            placeholder="URL immagine"
                            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                        />

                        <div className="md:col-span-2 flex gap-3">
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                onChange={
                                    handleInputChange
                                }
                                placeholder="Barcode"
                                className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setIsScanning(true)
                                }
                                className="bg-gray-900 text-white px-5 py-3 rounded-2xl font-bold hover:bg-black transition whitespace-nowrap"
                            >
                                Usa Scanner
                            </button>
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition"
                            >
                                Salva prodotto
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {isLoading ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-8">
                    Caricamento prodotti...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                        const isLowStock =
                            product.stockQuantity <
                            product.reorderThreshold;

                        const quantity =
                            orderQuantities[
                                product.id
                                ] ?? 1;

                        const totalAmount =
                            quantity * product.price;

                        return (
                            <div
                                key={product.id}
                                className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition"
                            >
                                <div className="h-60 bg-gray-50 border-b border-gray-100 flex items-center justify-center p-6">
                                    {product.imageUrl ? (
                                        <img
                                            src={`/products/${product.imageUrl}`}
                                            alt={
                                                product.name
                                            }
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Package className="w-20 h-20 text-gray-300" />
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">
                                                {product.name}
                                            </h2>

                                            <p className="text-gray-500 font-medium">
                                                {
                                                    product.category
                                                }
                                            </p>
                                        </div>

                                        {isLowStock ? (
                                            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                                    Sotto soglia
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                                            Disponibile
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-5">
                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs text-gray-500 font-bold">
                                                Giacenza
                                            </p>

                                            <p className="text-2xl font-black text-gray-900">
                                                {
                                                    product.stockQuantity
                                                }
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs text-gray-500 font-bold">
                                                Soglia
                                            </p>

                                            <p className="text-2xl font-black text-gray-900">
                                                {
                                                    product.reorderThreshold
                                                }
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs text-gray-500 font-bold">
                                                Prezzo
                                            </p>

                                            <p className="text-xl font-black text-blue-700">
                                                €
                                                {Number(
                                                    product.price
                                                ).toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs text-gray-500 font-bold">
                                                Barcode
                                            </p>

                                            <p className="text-xs font-mono text-gray-700 truncate">
                                                {product.barcode ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 border-t border-gray-100 pt-5">
                                        <p className="text-center text-sm font-black text-gray-700 mb-2">
                                            Quantità da ordinare
                                        </p>

                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(
                                                e
                                            ) =>
                                                updateQuantity(
                                                    product.id,
                                                    Number(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                )
                                            }
                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-center text-2xl font-black outline-none focus:ring-2 focus:ring-blue-200"
                                        />

                                        <div className="text-center mt-4 mb-5">
                                            <p className="text-xs text-gray-500 font-bold">
                                                Totale ordine
                                            </p>

                                            <p className="text-2xl font-black text-blue-700">
                                                €
                                                {totalAmount.toFixed(
                                                    2
                                                )}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                createOrder(
                                                    product
                                                )
                                            }
                                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition inline-flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            Crea ordine
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            <Paginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchProducts(page)}
            />
        </div>
    );
}