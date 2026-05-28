"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import BarcodeScanner from "../../../components/BarcodeScanner";
import AlertModal from "../../../components/AlertModal";
import { useRouter } from "next/navigation";
import {
    Package,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Truck,
    ShoppingCart,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ScannerPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [activeForm, setActiveForm] = useState<"shipment" | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info" as "success" | "error" | "info",
    });

    const router = useRouter();

    const closeModal = () =>
        setModal((prev) => ({ ...prev, isOpen: false }));

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");

        if (!token) {
            throw new Error("Token non presente. Effettua nuovamente il login.");
        }

        return { Authorization: `Bearer ${token}` };
    }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/inventory/products?page=0&size=50`, {
                    headers: getAuthHeaders(),
                });

                if (!res.ok) {
                    throw new Error("Errore caricamento prodotti");
                }

                const data = await res.json();
                setProducts(Array.isArray(data) ? data : data.content || []);
            } catch (error) {
                console.error("Errore caricamento prodotti:", error);

                setModal({
                    isOpen: true,
                    title: "Errore caricamento",
                    message: "Impossibile caricare i prodotti dal magazzino.",
                    type: "error",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const foundProduct = products.find((p) => p.barcode === scannedBarcode);

    async function handleRestockRequest() {
        if (!foundProduct) return;

        try {
            setIsSubmitting(true);

            const response = await fetch(`${API_BASE_URL}/api/notifications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    targetRole: "PROCUREMENT",
                    title: "Sollecito rifornimento da magazzino",
                    message: `Antonio richiede urgentemente un rifornimento di ${foundProduct.name}. Giacenza attuale: ${foundProduct.stockQuantity}, soglia minima: ${foundProduct.reorderThreshold}.`,
                }),
            });

            if (!response.ok) {
                throw new Error("Errore invio notifica");
            }

            setModal({
                isOpen: true,
                title: "Richiesta effettuata",
                message: `Richiesta di rifornimento effettuata con successo per ${foundProduct.name}.`,
                type: "success",
            });
        } catch (error) {
            console.error("Errore invio notifica:", error);

            setModal({
                isOpen: true,
                title: "Errore richiesta",
                message: "Errore durante l'invio della richiesta di rifornimento.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleShipmentRequest() {
        if (!foundProduct) return;

        if (quantity <= 0) {
            setModal({
                isOpen: true,
                title: "Quantità non valida",
                message: "Inserisci una quantità maggiore di zero.",
                type: "info",
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(
                `${API_BASE_URL}/api/pos/prepare-shipment?storeId=1&productId=${foundProduct.id}&quantity=${quantity}`,
                {
                    method: "POST",
                    headers: getAuthHeaders(),
                }
            );

            if (!response.ok) {
                const text = await response.text();

                if (
                    text.toLowerCase().includes("stock") ||
                    text.toLowerCase().includes("giacenza") ||
                    text.toLowerCase().includes("insufficient")
                ) {
                    throw new Error(
                        "Stock insufficiente nel magazzino centrale per effettuare la spedizione."
                    );
                }

                throw new Error(`Errore spedizione: ${response.status} ${text}`);
            }

            await fetch(`${API_BASE_URL}/api/notifications`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAuthHeaders(),
                },
                body: JSON.stringify({
                    targetRole: "POS",
                    title: "Merce spedita al punto vendita",
                    message: `Il magazzino ha spedito ${quantity} unità di ${foundProduct.name} al punto vendita Taasselunga Torino - Via Po.`,
                }),
            });

            setActiveForm(null);

            setModal({
                isOpen: true,
                title: "Spedizione preparata",
                message: `Spedizione di ${quantity} unità di ${foundProduct.name} verso il punto vendita preparata con successo.`,
                type: "success",
            });
        } catch (error) {
            console.error("Errore spedizione:", error);

            setModal({
                isOpen: true,
                title: "Errore spedizione",
                message:
                    error instanceof Error
                        ? error.message
                        : "Errore durante la preparazione della spedizione.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    function resetScanner() {
        setScannedBarcode(null);
        setActiveForm(null);
        setQuantity(1);
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <AlertModal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />

            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/inventory")}
                    className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>

                <div>
                    <h1 className="text-3xl font-black text-gray-900">
                        Scanner Magazzino
                    </h1>

                    <p className="text-gray-500 font-medium mt-1">
                        Scansiona un prodotto, consulta le informazioni e avvia un’azione operativa.
                    </p>
                </div>
            </div>

            {!scannedBarcode ? (
                <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
                    <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Pronto per la scansione
                    </h2>

                    <p className="text-gray-500 mb-8">
                        Avvia la fotocamera per leggere il codice a barre del prodotto.
                    </p>

                    <button
                        onClick={() => {
                            setActiveForm(null);
                            setQuantity(1);
                            setScannedBarcode("avvia_scanner");
                        }}
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
                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="mb-6">
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            Codice rilevato
                        </span>

                        <p className="text-2xl font-mono font-black text-gray-900 mt-1">
                            {scannedBarcode}
                        </p>
                    </div>

                    {foundProduct ? (
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 h-64 flex items-center justify-center overflow-hidden">
                                    {foundProduct.imageBase64 ? (
                                        <img
                                            src={`data:image/jpeg;base64,${foundProduct.imageBase64}`}
                                            alt={foundProduct.name}
                                            className="w-full h-full object-contain p-5"
                                        />
                                    ) : (
                                        <Package className="w-20 h-20 text-gray-300" />
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-5">
                                        <div>
                                            <h3 className="text-3xl font-black text-gray-900">
                                                {foundProduct.name}
                                            </h3>

                                            <p className="text-gray-500 font-bold mt-1">
                                                {foundProduct.category}
                                            </p>
                                        </div>

                                        <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-gray-500">
                                                Giacenza
                                            </p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {foundProduct.stockQuantity}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-gray-500">
                                                Soglia minima
                                            </p>
                                            <p className="text-2xl font-black text-gray-900">
                                                {foundProduct.reorderThreshold}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-gray-500">
                                                Prezzo
                                            </p>
                                            <p className="text-2xl font-black text-blue-700">
                                                €{Number(foundProduct.price).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-gray-500">
                                                Barcode
                                            </p>
                                            <p className="text-sm font-black text-gray-900 break-all">
                                                {foundProduct.barcode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            setActiveForm("shipment");
                                            setQuantity(1);
                                        }}
                                        disabled={isSubmitting}
                                        className="bg-gray-900 text-white px-6 py-4 rounded-2xl font-black hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                                    >
                                        <Truck className="w-5 h-5" />
                                        Spedisci al punto vendita
                                    </button>

                                    <button
                                        onClick={handleRestockRequest}
                                        disabled={isSubmitting}
                                        className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {isSubmitting ? "Invio..." : "Sollecita rifornimento"}
                                    </button>
                                </div>

                                {activeForm === "shipment" && (
                                    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">
                                        <h4 className="text-xl font-black text-gray-900 mb-2">
                                            Spedizione al punto vendita
                                        </h4>

                                        <p className="text-gray-500 font-medium mb-5">
                                            Inserisci la quantità da spedire al punto vendita.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Quantità
                                                </label>

                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                                    className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-xl font-black text-center outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                                                />
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                                <p className="text-xs font-bold text-gray-500">
                                                    Totale stimato
                                                </p>

                                                <p className="text-2xl font-black text-blue-700">
                                                    €{(quantity * foundProduct.price).toFixed(2)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleShipmentRequest}
                                                disabled={isSubmitting}
                                                className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                                            >
                                                {isSubmitting ? "Invio..." : "Conferma spedizione"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
                            <XCircle className="w-8 h-8 text-red-600 shrink-0" />

                            <div>
                                <h3 className="text-xl font-black text-red-900">
                                    Prodotto non trovato
                                </h3>

                                <p className="text-red-700 font-medium">
                                    Il codice a barre non corrisponde a nessun articolo registrato a sistema.
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={resetScanner}
                        className="mt-8 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold transition w-full md:w-auto"
                    >
                        Effettua un'altra scansione
                    </button>
                </div>
            )}
        </div>
    );
}