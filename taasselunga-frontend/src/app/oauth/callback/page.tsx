"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        async function exchangeCodeForToken() {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");

            if (!code) {
                router.push("/");
                return;
            }

            const body = new URLSearchParams({
                client_id: "taasselunga_frontend",
                grant_type: "authorization_code",
                code,
                redirect_uri: "http://localhost:3000/oauth/callback",
            });

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

            if (!response.ok) {
                console.error("Errore OAuth2 callback");
                router.push("/");
                return;
            }

            const data = await response.json();

            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);

            router.push("/dashboard");
        }

        exchangeCodeForToken();
    }, [router]);

    return (
        <main className="min-h-screen flex items-center justify-center">
            <p>Completamento login Google...</p>
        </main>
    );
}