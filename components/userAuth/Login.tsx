"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { setToken } from "@/utils/authUtils";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { toast } from "react-toastify";

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!form.email && !form.password) {
            toast.error("Please fill the email and password.");
            return false;
        }
        if (!form.email) {
            toast.error("Please enter email");
            return false;
        }
        if (!form.password) {
            toast.error("Please enter password");
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                setToken(data.token, form.email);
                localStorage.setItem("email", form.email); 
                setTimeout(() => {
                    toast.success("Login successful!");
                }, 1000);
                if (data.role === "admin") {
                    router.push("/admin/roof-types");
                } else {
                    router.push("/");
                }
            } else {
                setTimeout(() => {
                    toast.error(data.message || "Invalid credentials");
                }, 1000);
            }
        } catch (error) {
            setTimeout(() => {
                toast.error("An error occurred. Please try again.");
            }, 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-xl p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        onChange={handleChange}
                        value={form.email}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
                <div className="mb-4 relative">
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter password"
                        onChange={handleChange}
                        value={form.password}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 cursor-pointer text-gray-500"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`w-full py-2 px-4 ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"} text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-600 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
