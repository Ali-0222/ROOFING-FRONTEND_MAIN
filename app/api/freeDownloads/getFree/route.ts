import { NextResponse } from "next/server";
import { query, where, collection, getDocs } from "firebase/firestore";
import { fireDB } from "@/config/firebase";

// GET API to fetch remaining free downloads based on user email
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email is required." }, { status: 400 });
        }

        const userQuery = query(collection(fireDB, "users"), where("email", "==", email));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        return NextResponse.json(
            {
                email: email,
                freeDownloads: userData.freeDownloads,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: "An internal server error occurred. Please try again later." },
            { status: 500 }
        );
    }
}
