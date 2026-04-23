"use client";
import React from 'react';

export default function DashboardPage() {
    return (
        <>
            <header className="mb-8 mt-4 md:mt-0">
                <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-2">Benvenuta, Alessia 👋</h2>
                <p className="text-gray-500 font-medium">Ecco il riepilogo della situazione attuale.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Card: Prodotti Sotto Soglia */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Prodotti sotto soglia</h3>
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">Urgenti</span>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-100 rounded-xl gap-4 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-2xl border border-gray-100">🥛</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">Latte Parmalat 1L</p>
                                    <div className="flex items-center gap-4 mt-1 text-sm">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            <span className="text-gray-500">Giacenza:</span>
                                            <span className="font-black text-red-600">135</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 border-l border-gray-200 pl-4">
                                            <span className="text-gray-500">Soglia min:</span>
                                            <span className="font-bold text-gray-700">200</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                Ordina Subito
                            </button>
                        </div>
                    </div>
                </div>

                {/* Card: Ordini da Confermare */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Bozze d'ordine</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Da inviare</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="text-4xl mb-3 opacity-40">📄</div>
                        <p className="text-gray-500 font-bold mb-1">Nessuna bozza da confermare</p>
                        <p className="text-xs text-gray-400 max-w-[250px]">Le bozze generate automaticamente per i prodotti sotto soglia appariranno qui.</p>
                    </div>
                </div>
            </div>
        </>
    );
}