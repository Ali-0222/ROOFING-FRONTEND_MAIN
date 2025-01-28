import { fireDB } from "@/config/firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const roofTypesCollection = collection(fireDB, "roofTypes");
        const snapshot = await getDocs(roofTypesCollection);
        const roofTypes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ success: true, data: roofTypes });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error fetching data.", error });
    }
}

export async function POST(req: Request) {
    try {
        const { name, materialIds } = await req.json();
        if (!name) {
            return NextResponse.json({ success: false, message: "Roof type name is required." });
        }

        const roofTypesCollection = collection(fireDB, "roofTypes");
        const docRef = await addDoc(roofTypesCollection, { name, materialIds: materialIds || [] });
        return NextResponse.json({ success: true, data: { id: docRef.id, name, materialIds } });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error adding roof type.", error });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, name, materialIds } = await req.json();
        if (!id || !name) {
            return NextResponse.json({
                success: false,
                message: "Roof type ID and name are required.",
            });
        }

        const roofTypeDoc = doc(fireDB, "roofTypes", id);
        await updateDoc(roofTypeDoc, { name, materialIds: materialIds || [] });
        return NextResponse.json({ success: true, data: { id, name, materialIds } });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error updating roof type.", error });
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return NextResponse.json({ success: false, message: "Roof type ID is required." });
        }

        const roofTypeDoc = doc(fireDB, "roofTypes", id);
        await deleteDoc(roofTypeDoc);
        return NextResponse.json({ success: true, message: "Roof type deleted successfully." });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error deleting roof type.", error });
    }
}
