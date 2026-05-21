"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isAllowed, setIsAllowed] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            router.replace("/");
            return;
        }

        setIsAllowed(true);
        setIsMounted(true);
    }, [router]);

    if (!isMounted || !isAllowed) {
        return null;
    }

    return <>{children}</>;
}