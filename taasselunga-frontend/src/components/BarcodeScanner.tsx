import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Inizializza lo scanner
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 300, height: 150 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            },
            false
        );

        scanner.render(
            (decodedText) => {
                // Quando legge un codice, ferma la fotocamera e passa il dato
                scanner.clear();
                onScan(decodedText);
            },
            (errorMessage) => {
                // Ignora gli errori continui di quando non vede un codice
            }
        );

        // Spegne la fotocamera quando si chiude il componente
        return () => {
            scanner.clear().catch(console.error);
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">Inquadra il Codice a Barre</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500 font-bold transition-colors"
                    >
                        Chiudi
                    </button>
                </div>

                {/* Qui dentro la libreria inietterà il flusso video della webcam del Mac */}
                <div id="reader" ref={scannerRef} className="rounded-xl overflow-hidden border-2 border-blue-100"></div>

                <p className="text-center text-sm text-slate-500 font-medium mt-4">
                    Avvicina il codice a barre del prodotto alla fotocamera.
                </p>
            </div>
        </div>
    );
}