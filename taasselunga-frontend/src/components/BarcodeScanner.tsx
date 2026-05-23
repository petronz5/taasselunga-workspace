"use client";

import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        let stream: MediaStream | null = null;
        let animationFrameId: number;

        const startScanner = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    scanFrame();
                }
            } catch (err) {
                setError("Impossibile accedere alla fotocamera. Verifica i permessi.");
            }
        };

        const scanFrame = async () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                if ('BarcodeDetector' in window) {
                    try {
                        const barcodeDetector = new (window as any).BarcodeDetector({
                            formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e']
                        });
                        const barcodes = await barcodeDetector.detect(videoRef.current);
                        if (barcodes.length > 0) {
                            onScan(barcodes[0].rawValue);
                            return;
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            animationFrameId = requestAnimationFrame(scanFrame);
        };

        startScanner();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [onScan]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            {error ? (
                <div className="text-white bg-red-600 p-4 rounded-md mb-4">{error}</div>
            ) : (
                <video ref={videoRef} className="w-full max-w-md h-auto bg-gray-900" playsInline muted />
            )}
            <button
                onClick={onClose}
                className="mt-8 px-6 py-3 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gray-200 transition-colors"
            >
                Chiudi Scanner
            </button>
        </div>
    );
}