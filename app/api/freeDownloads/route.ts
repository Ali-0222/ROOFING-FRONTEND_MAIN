import { NextResponse } from "next/server";
import { doc, getDocs, query, where, collection, updateDoc } from "firebase/firestore";
import { fireDB } from "@/config/firebase";

// POST API to decrement free downloads
export async function POST(request: Request) {
    try {
        // Parse the request body to get the email
        const { email } = await request.json();

        // Validate email
        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        // Query Firestore to find the user by email
        const userQuery = query(collection(fireDB, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(userQuery);

        // Check if the user exists
        if (querySnapshot.empty) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        // Assuming email is unique, get the first matched document
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // Validate and decrement free downloads count
        if (userData?.freeDownloads > 0) {
            const updatedFreeDownloads = userData.freeDownloads - 1;

            // Update the Firestore document with the new free downloads count
            await updateDoc(doc(fireDB, "users", userDoc.id), {
                freeDownloads: updatedFreeDownloads,
            });

            return NextResponse.json(
                {
                    message: "Free download count decremented successfully.",
                    freeDownloads: updatedFreeDownloads,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: "No free downloads remaining buy Plan." },
                { status: 403 }
            );
        }
    } catch (error: any) {
        // Generic error response
        return NextResponse.json(
            { error: "An internal server error occurred. Please try again later." },
            { status: 500 }
        );
    }
}


