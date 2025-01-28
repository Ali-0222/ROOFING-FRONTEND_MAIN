"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify"; // Import toast
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state for button
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const errors: string[] = [];

        // First name, last name, email, password checks
        if (!form.firstName) errors.push("First Name");
        if (!form.lastName) errors.push("Last Name");
        if (!form.email) errors.push("Email");
        if (!form.password) errors.push("Password");

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.email && !emailRegex.test(form.email)) {
            errors.push("Invalid email format");
        }

        // Password length validation
        if (form.password && form.password.length < 6) {
            errors.push("Password must be at least 6 characters");
        }

        // Show error messages via toast
        if (errors.length > 1) {
            toast.error("Please fill the form to continue.");
        } else if (errors.length === 1) {
            toast.error(`${errors[0]}`);
        } else if (errors.length > 1) {
            errors.forEach((error) => toast.error(error));
        }

        return errors.length === 0; // Return true if no errors
    };

    const handleSignup = async () => {
        if (!validateForm()) return; // Only proceed if form is valid

        setLoading(true); // Set loading to true
        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                toast.success("Signup successful! Redirecting...");
                setTimeout(() => router.push("/login"), 2000); // Delay for user to see toast
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Signup failed");
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input 
                        name="firstName"
                        placeholder="First Name"
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input 
                        name="lastName"
                        placeholder="Last Name"
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input 
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <span 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 cursor-pointer text-gray-500">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <button 
                    onClick={handleSignup}
                    className={`w-full py-2 px-4 font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                    disabled={loading} // Disable button while loading
                >
                    {loading ? "Signing Up..." : "Sign Up"}
                </button>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
