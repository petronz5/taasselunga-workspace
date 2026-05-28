"use client";

import React, { useEffect, useRef } from "react";
import {
    BrowserMultiFormatReader,
    IScannerControls,
} from "@zxing/browser";

interface BarcodeScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const controlsRef = useRef<IScannerControls | null>(null);
    const hasScannedRef = useRef(false);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();

        async function startScanner() {
            try {
                controlsRef.current = await codeReader.decodeFromVideoDevice(
                    undefined,
                    videoRef.current!,
                    (result, error, controls) => {
                        if (result && !hasScannedRef.current) {
                            hasScannedRef.current = true;

                            controls.stop();
                            onScan(result.getText());
                        }
                    }
                );
            } catch (error) {
                console.error("Errore avvio scanner ZXing:", error);
            }
        }

        startScanner();

        return () => {
            controlsRef.current?.stop();
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">
                        Inquadra il codice a barre
                    </h3>

                    <button
                        onClick={() => {
                            controlsRef.current?.stop();
                            onClose();
                        }}
                        className="text-gray-500 hover:text-red-500 font-bold transition-colors"
                    >
                        Chiudi
                    </button>
                </div>

                <video
                    ref={videoRef}
                    className="w-full rounded-xl border-2 border-blue-100 bg-black"
                    muted
                    playsInline
                />

                <p className="text-center text-sm text-slate-500 font-medium mt-4">
                    Tieni il barcode orizzontale, ben illuminato e a 20-40 cm dalla fotocamera.
                </p>
            </div>
        </div>
    );
}