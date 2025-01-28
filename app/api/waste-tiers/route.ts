import { fireDB } from "@/config/firebase"; // Ensure the Firebase configuration is correct
import { collection, getDocs, addDoc, doc, deleteDoc, where, query, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

// **GET** - Fetch all waste tiers
export async function GET() {
    try {
        const wasteTiersCollection = collection(fireDB, "wasteTiers");
        const snapshot = await getDocs(wasteTiersCollection);
        const wasteTiers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ success: true, data: wasteTiers });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error fetching waste tiers.", error });
    }
}

// **POST** - Add a new waste tier
export async function POST(req: Request) {
    try {
        const { roofType, wasteTier } = await req.json();

        // Basic validation
        if (!roofType || wasteTier === undefined) {
            return NextResponse.json({ success: false, message: "Required fields are missing." });
        }

        const wasteTiersCollection = collection(fireDB, "wasteTiers");

        // Check if a document with the same roofType exists
        const q = query(wasteTiersCollection, where("roofType", "==", roofType));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // If the document exists, update it
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, { wasteTier });
            return NextResponse.json({
                success: true,
                message: "Waste tier updated successfully.",
                data: { id: docRef.id, roofType, wasteTier },
            });
        } else {
            // If the document does not exist, add a new one
            const docRef = await addDoc(wasteTiersCollection, { roofType, wasteTier });
            return NextResponse.json({
                success: true,
                message: "Waste tier added successfully.",
                data: { id: docRef.id, roofType, wasteTier },
            });
        }
    } catch (error) {
        console.error("Error handling POST request:", error);
        return NextResponse.json({ success: false, message: "Error adding or updating waste tier.", error });
    }
}

// **DELETE** - Delete a waste tier
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        // Basic validation
        if (!id) {
            return NextResponse.json({ success: false, message: "Waste tier ID is required." });
        }

        const wasteTierDoc = doc(fireDB, "wasteTiers", id);
        await deleteDoc(wasteTierDoc);
        return NextResponse.json({ success: true, message: "Waste tier deleted successfully." });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error deleting waste tier.", error });
    }
}
