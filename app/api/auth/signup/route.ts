import { NextResponse } from "next/server";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, fireDB } from "@/config/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(request: Request) {
    try {
        const { firstName, lastName, email, password } = await request.json();

        // Validate input fields
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            );
        }

        // Create a new user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Prepare user data for Firestore
        const userData = {
            firstName,
            lastName,
            email,
            freeDownloads: 10,
            subscribe: false,
            paymentIntentId: null,
            customerId: null,
            createdAt: new Date().toISOString(),
        };

        // Store user data in Firestore under the user's UIDs
        await setDoc(doc(fireDB, "users", user.uid), userData);

        return NextResponse.json(
            { message: "User registered successfully." },
            { status: 201 }
        );
    } catch (error: any) {
        let errorMessage = "An error occurred during registration.";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "Email is already in use. Please try another one.";
        } 

        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}
