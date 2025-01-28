"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, getUserRole } from "@/utils/authUtils"; // Update authUtils to include getUserRole

const PrivateAdminRoute = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true); // Track loading state

    useEffect(() => {
        const checkAuth = () => {
            // Check if user is authenticated
            if (!isAuthenticated()) {
                router.replace("/login"); // Redirect immediately if not authenticated
            } else {
                // Check if the user is an admin
                const role = getUserRole(); // Get role from token or backend
                if (role !== 'admin') {
                    router.replace("/login"); // Redirect to login if not admin
                } else {
                    setIsLoading(false); // Stop loading once authenticated and admin
                }
            }
        };
        checkAuth();
    }, [router]);

    // Show nothing or a loader until authentication check is complete
    if (isLoading) {
        return null; // Or you can return a loader component here if needed
    }

    return <>{children}</>;
};

export default PrivateAdminRoute;
