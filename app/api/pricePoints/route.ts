import { fireDB } from "@/config/firebase"; // Ensure the Firebase configuration is correct
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

// **GET** - Fetch all price points
export async function GET() {
    try {
        const pricePointsCollection = collection(fireDB, "pricePoints");
        const snapshot = await getDocs(pricePointsCollection);
        const pricePoints = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ success: true, data: pricePoints });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error fetching price points.", error });
    }
}

// **POST** - Add a new price point
export async function POST(req: Request) {
    try {
        const { zipCode, price, additionalFee, roofType } = await req.json();

        // Basic validation
        if (!zipCode || !price || !roofType) {
            return NextResponse.json({ success: false, message: "Required fields are missing." });
        }

        const pricePointsCollection = collection(fireDB, "pricePoints");

        // Check if a document with the same roofType already exists
        const querySnapshot = await getDocs(query(pricePointsCollection, where("roofType", "==", roofType)));

        if (!querySnapshot.empty) {
            // If a document with the same roofType exists, update it
            const docId = querySnapshot.docs[0].id;
            const docRef = doc(pricePointsCollection, docId);
            await updateDoc(docRef, { zipCode, price, additionalFee: additionalFee || 0 });
            return NextResponse.json({
                success: true,
                message: "Existing price point updated.",
                data: { id: docId, zipCode, price, additionalFee: additionalFee || 0, roofType },
            });
        } else {
            // If no document with the same roofType exists, add a new one
            const docRef = await addDoc(pricePointsCollection, { zipCode, price, additionalFee: additionalFee || 0, roofType });
            return NextResponse.json({
                success: true,
                message: "New price point added.",
                data: { id: docRef.id, zipCode, price, additionalFee: additionalFee || 0, roofType },
            });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error adding price point.", error });
    }
}


// **PUT** - Update an existing price point
export async function PUT(req: Request) {
    try {
        const { id, zipCode, price, additionalFee, roofType } = await req.json();

        // Basic validation
        if (!id || !zipCode || !price || !roofType) {
            return NextResponse.json({
                success: false,
                message: "Required fields are missing.",
            });
        }

        const pricePointDoc = doc(fireDB, "pricePoints", id);
        await updateDoc(pricePointDoc, { zipCode, price, additionalFee: additionalFee || 0, roofType });
        return NextResponse.json({
            success: true,
            data: { id, zipCode, price, additionalFee: additionalFee || 0, roofType },
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error updating price point.", error });
    }
}

// **DELETE** - Delete a price point
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        // Basic validation
        if (!id) {
            return NextResponse.json({ success: false, message: "Price point ID is required." });
        }

        const pricePointDoc = doc(fireDB, "pricePoints", id);
        await deleteDoc(pricePointDoc);
        return NextResponse.json({ success: true, message: "Price point deleted successfully." });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error deleting price point.", error });
    }
}
