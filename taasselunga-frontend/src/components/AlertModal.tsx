import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }: AlertModalProps) {
    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />,
        error: <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />,
        info: <Info className="w-12 h-12 text-blue-500 mx-auto mb-4" />
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all zoom-in-95">
                <div className="text-center">
                    {icons[type]}
                    <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-500 mb-6 font-medium">{message}</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    );
}