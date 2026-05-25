"use client";

import React, { useEffect, useState } from "react";
import { ShoppingCart, CreditCard, Banknote, Trash2 } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
}

interface CartItem extends Product {
    cartQuantity: number;
}

export default function NewSalePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    function getAuthHeaders() {
        const token = localStorage.getItem("access_token");
        return { Authorization: `Bearer ${token}` };
    }

    async function loadProducts() {
        try {
            const response = await fetch("http://localhost:8080/api/inventory/products?page=0&size=50", {
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : data.content || []);
        } catch (error) {
            console.error("Error loading products:", error);
        } finally {
            setLoading(false);
        }
    }

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
                );
            }
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setCheckoutLoading(true);

        const salePayload = {
            storeId: 1, // Hardcoded per questo POS
            totalAmount: totalAmount,
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.cartQuantity,
                unitPrice: item.price
            }))
        };

        try {
            const response = await fetch("http://localhost:8080/api/pos/sales", {
                method: "POST",
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(salePayload)
            });

            if (!response.ok) throw new Error("Checkout failed");

            alert("Sale completed successfully!");
            setCart([]);
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("Error processing sale.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Sezione Sinistra - Prodotti */}
            <div className="flex-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-y-auto">
                <h2 className="text-2xl font-black text-slate-900 mb-6">Point of Sale</h2>
                {loading ? (
                    <p className="text-slate-500">Loading catalog...</p>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {products.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => addToCart(p)}
                                className="flex flex-col items-center p-4 border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all bg-slate-50"
                            >
                                <div className="w-16 h-16 bg-white rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                                    {p.imageUrl ? (
                                        <img src={`/products/${p.imageUrl}`} alt={p.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <ShoppingCart className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>
                                <span className="font-bold text-slate-800 text-sm text-center">{p.name}</span>
                                <span className="text-blue-600 font-black mt-1">€{p.price.toFixed(2)}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Sezione Destra - Carrello */}
            <div className="w-[400px] bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-blue-600" /> Current Order
                    </h2>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                    {cart.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                            Cart is empty
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {cart.map((item) => (
                                <li key={item.id} className="flex justify-between items-center group">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{item.name}</span>
                                        <span className="text-sm text-slate-500">
                                            {item.cartQuantity} x €{item.price.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-slate-900">
                                            €{(item.cartQuantity * item.price).toFixed(2)}
                                        </span>
                                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-slate-500 font-bold">Total:</span>
                        <span className="text-3xl font-black text-slate-900">€{totalAmount.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || checkoutLoading}
                        className="w-full flex justify-center items-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black disabled:opacity-50 transition"
                    >
                        {checkoutLoading ? "Processing..." : (
                            <>
                                <CreditCard className="w-5 h-5" /> Complete Checkout
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}