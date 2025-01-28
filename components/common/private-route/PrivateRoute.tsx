"use client";

import { useRouter } from "next/navigation"; // Use next/navigation
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/utils/authUtils";
import { usePathname } from "next/navigation"; // Import usePathname for current route

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname(); // Use usePathname for current route
    const [isLoading, setIsLoading] = useState(true); // Track loading state

    useEffect(() => {
        const checkAuth = () => {
            if (!isAuthenticated()) {
                router.replace("/login"); // Redirect to login if no token
            } else {
                // Check if the email in local storage is "admin@email.com"
                const storedEmail = localStorage.getItem("email");
                if (storedEmail === "admin@email.com" && pathname === "/") {
                    // Redirect from root (/) to /admin/roof-types if admin
                    router.replace("/admin/roof-types");
                } else {
                    setIsLoading(false); // Stop loading once authenticated
                }
            }
        };
        checkAuth();
    }, [router, pathname]); // Add pathname to dependencies

    // Show nothing or a loader until authentication check is complete
    if (isLoading) {
        return null; // Or you can return a loader component here if needed
    }

    return <>{children}</>;
};

export default PrivateRoute;
