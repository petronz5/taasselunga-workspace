"use client";

import { useState } from "react";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";

import {
    auth,
    googleProvider,
    facebookProvider,
} from "../lib/firebase";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function saveSessionAndRedirect(user: any) {
        const token = await user.getIdToken(true);
        const userEmail = user.email || "";

        localStorage.setItem("access_token", token);
        localStorage.setItem("user_email", userEmail);
        localStorage.setItem("user_name", user.displayName || "");

        if (userEmail.toLowerCase() === "alessia@taasselunga.it") {
            window.location.href = "/procurement";
            return;
        }

        if (
            userEmail.toLowerCase() === "antonio@taasselunga.it" ||
            userEmail.toLowerCase() === "luca.disalvo01@gmail.com" ||
            userEmail.toLowerCase() === "luca.disalvo40@edu.unito.it" ||
            userEmail.toLowerCase() === "luca.disalvo40@unito.it"
        ) {
            window.location.href = "/inventory";
            return;
        }

        if (userEmail.toLowerCase() === "luigi@taasselunga.it") {
            window.location.href = "/pos";
            return;
        }

        setError("Utente non autorizzato");

        localStorage.removeItem("access_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("user_name");
    }

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            await saveSessionAndRedirect(result.user);
        } catch (err: any) {
            console.error(err);
            setError("Email o password non validi");
        }
    }

    async function handleGoogleLogin() {
        setError("");

        try {
            const result = await signInWithPopup(auth, googleProvider);
            await saveSessionAndRedirect(result.user);
        } catch (err: any) {
            console.error(err);
            setError("Errore durante il login con Google");
        }
    }

    async function handleFacebookLogin() {
        setError("");

        try {
            const result = await signInWithPopup(auth, facebookProvider);
            await saveSessionAndRedirect(result.user);
        } catch (err: any) {
            console.error(err);
            setError("Errore durante il login con Facebook");
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2ff] flex items-center justify-center px-4 py-6">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-gray-100 px-8 py-7"
            >
                <div className="flex justify-center mb-5">
                    <img
                        src="/logo-taasselunga.png"
                        alt="Taasselunga"
                        className="w-[190px] h-auto object-contain"
                    />
                </div>

                <div className="text-center mb-5">
                    <h1 className="text-2xl font-black text-[#1B3557]">
                        Benvenuto!
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Accedi all’area riservata Taasselunga
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#1B3557] mb-2">
                            Email aziendale
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Inserisci la tua email"
                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B3557] transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#1B3557] mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Inserisci la tua password"
                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1B3557] transition"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full mt-5 bg-[#1B3557] text-white py-3 rounded-2xl font-bold text-sm hover:scale-[1.01] hover:opacity-95 transition-all"
                >
                    Accedi
                </button>

                <div className="flex items-center gap-4 my-5">
                    <div className="h-px bg-gray-200 flex-1" />

                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Oppure
                </span>

                    <div className="h-px bg-gray-200 flex-1" />
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full border border-gray-200 bg-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition"
                    >
                        <img
                            src="/logo-google.png"
                            alt="Google"
                            className="w-5 h-5 object-contain"
                        />

                        Continua con Google
                    </button>

                    <button
                        type="button"
                        onClick={handleFacebookLogin}
                        className="w-full border border-gray-200 bg-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition"
                    >
                        <img
                            src="/logo-fb.png"
                            alt="Facebook"
                            className="w-5 h-5 object-contain"
                        />

                        Continua con Facebook
                    </button>
                </div>
            </form>
        </main>
    );
}