"use client";

import { useState } from "react";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

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

        if (userEmail.toLowerCase() === "antonio@taasselunga.it") {
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

    return (
        <main className="min-h-screen bg-white flex items-center justify-center">
            <form onSubmit={handleLogin} className="w-[380px]">
                <div className="flex justify-center mb-8">
                    <img
                        src="/logo-taasselunga.png"
                        alt="Taasselunga"
                        className="w-[240px] h-auto object-contain"
                    />
                </div>

                <p className="text-center text-sm font-semibold text-[#1B3557]">
                    Accesso all’area riservata
                </p>

                <p className="text-center text-sm text-[#1B3557] mb-10">
                    Solo personale autorizzato
                </p>

                <div className="mb-5">
                    <label className="block text-xs font-semibold text-[#1B3557] mb-1">
                        Email aziendale
                    </label>

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Inserisci la tua email"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm outline-none"
                        required
                    />
                </div>

                <div className="mb-3">
                    <label className="block text-xs font-semibold text-[#1B3557] mb-1">
                        Password
                    </label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Inserisci la tua password"
                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm outline-none"
                        required
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                )}

                <button
                    type="submit"
                    className="w-full bg-[#1B3557] text-white py-3 rounded-md font-semibold text-sm hover:opacity-90 transition"
                >
                    Login
                </button>

                <div className="flex items-center gap-4 my-9">
                    <div className="h-px bg-[#1B3557] flex-1" />

                    <span className="text-xs text-gray-500">Or</span>

                    <div className="h-px bg-[#1B3557] flex-1" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full border border-gray-300 rounded-md py-3 text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
                >
                    <img
                        src="/logo-google.png"
                        alt="Google"
                        className="w-4 h-4 object-contain"
                    />

                    Sign in with Google
                </button>
            </form>
        </main>
    );
}