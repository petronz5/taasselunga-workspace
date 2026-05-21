"use client";

// useState serve per salvare i valori degli input
import { useState } from "react";

export default function LoginForm() {

    // Stato email inserita nel form
    const [email, setEmail] = useState("");

    // Stato password inserita nel form
    const [password, setPassword] = useState("");

    // Stato errore login
    const [error, setError] = useState("");

    /*
        LOGIN CLASSICO

        Questa funzione viene eseguita quando
        l’utente preme il bottone Login.

        Qui chiamiamo direttamente Keycloak
        usando username/password.
    */
    async function handleLogin(e: React.FormEvent) {

        // Evita il refresh automatico del form
        e.preventDefault();

        // Reset errore precedente
        setError("");

        try {

            /*
                Parametri richiesti da Keycloak
                per il login OAuth2 password grant.
            */
            const body = new URLSearchParams({

                // Client configurato su Keycloak
                client_id: "taasselunga_frontend",

                // Tipo di grant OAuth2
                grant_type: "password",

                // Username inviato a Keycloak
                username: email,

                // Password inviata a Keycloak
                password: password,
            });

            /*
                Chiamata HTTP a Keycloak.

                Keycloak verifica:
                - utente
                - password
                - realm
                - client
            */
            const response = await fetch(
                "http://localhost:9090/realms/taasselunga/protocol/openid-connect/token",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },

                    body,
                }
            );

            // Login fallito
            if (!response.ok) {
                throw new Error("Email o password non validi");
            }

            /*
                Se il login va bene,
                Keycloak restituisce:
                - access_token
                - refresh_token
            */
            const data = await response.json();

            console.log("LOGIN OK", data);

            /*
                Salviamo i token nel browser.

                Serviranno per:
                - chiamare API backend
                - proteggere dashboard
                - mantenere sessione login
            */
            localStorage.setItem(
                "access_token",
                data.access_token
            );

            localStorage.setItem(
                "refresh_token",
                data.refresh_token
            );

            // Redirect dashboard
            window.location.href = "/procurement";

        } catch (err: any) {

            console.error(err);

            setError(
                err.message || "Errore durante il login"
            );
        }
    }

    /*
        LOGIN GOOGLE

        Qui NON autentichiamo direttamente Google.

        Facciamo redirect a Keycloak,
        chiedendo di usare il provider Google.

        Keycloak poi:
        - apre Google
        - autentica utente
        - restituisce token
    */
    function handleGoogleLogin() {

        // URL base Keycloak
        const keycloakUrl = "http://localhost:9090";

        // Realm Keycloak
        const realm = "taasselunga";

        // Client frontend
        const clientId = "taasselunga_frontend";

        // Pagina dove tornare dopo login
        const redirectUri = "http://localhost:3000/oauth/callback";
        /*
            URL OAuth2 completo.

            kc_idp_hint=google
            dice a Keycloak:

            "usa direttamente Google".
        */
        const googleLoginUrl =

            `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth` +

            `?client_id=${clientId}` +

            `&redirect_uri=${encodeURIComponent(redirectUri)}` +

            `&response_type=code` +

            `&scope=openid email profile` +

            `&kc_idp_hint=google`;

        // Redirect browser
        window.location.href = googleLoginUrl;
    }

    return (

        <main className="min-h-screen bg-white flex items-center justify-center">

            {/* Form login */}
            <form
                onSubmit={handleLogin}
                className="w-[380px]"
            >

                {/* Logo Taasselunga */}
                <div className="flex justify-center mb-8">

                    <img
                        src="/logo-taasselunga.png"
                        alt="Taasselunga"
                        className="w-[240px] h-auto object-contain"
                    />

                </div>

                {/* Testi schermata */}
                <p className="text-center text-sm font-semibold text-[#1B3557]">
                    Accesso all’area riservata
                </p>

                <p className="text-center text-sm text-[#1B3557] mb-10">
                    Solo personale autorizzato
                </p>

                {/* Campo email */}
                <div className="mb-5">

                    <label className="block text-xs font-semibold text-[#1B3557] mb-1">
                        Email aziendale
                    </label>

                    <input
                        type="email"

                        value={email}

                        onChange={(e) =>
                            setEmail(e.target.value)
                        }

                        placeholder="Inserisci la tua email"

                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm outline-none"

                        required
                    />

                </div>

                {/* Campo password */}
                <div className="mb-3">

                    <label className="block text-xs font-semibold text-[#1B3557] mb-1">
                        Password
                    </label>

                    <input
                        type="password"

                        value={password}

                        onChange={(e) =>
                            setPassword(e.target.value)
                        }

                        placeholder="Inserisci la tua password"

                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm outline-none"

                        required
                    />

                </div>

                {/* Messaggio errore login */}
                {error && (

                    <p className="text-red-500 text-sm mb-4">
                        {error}
                    </p>

                )}

                {/* Bottone login classico */}
                <button
                    type="submit"

                    className="w-full bg-[#1B3557] text-white py-3 rounded-md font-semibold text-sm hover:opacity-90 transition"
                >
                    Login
                </button>

                {/* Separatore */}
                <div className="flex items-center gap-4 my-9">

                    <div className="h-px bg-[#1B3557] flex-1" />

                    <span className="text-xs text-gray-500">
                        Or
                    </span>

                    <div className="h-px bg-[#1B3557] flex-1" />

                </div>

                {/* Bottone Google OAuth2 */}
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