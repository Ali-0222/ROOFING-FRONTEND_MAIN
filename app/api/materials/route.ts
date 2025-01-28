import { fireDB } from "@/config/firebase"; // Import Firestore instance
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

// Fetch all materials
export async function GET() {
    try {
        const materialsCollection = collection(fireDB, "materials");
        const snapshot = await getDocs(materialsCollection);
        const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ success: true, data: materials });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Error fetching data.", error });
    }
}

// Add a new material and roofType
export async function POST(req: Request) {
    try {
        const { roofType, materials } = await req.json();

        // Validation
        if (!roofType || !Array.isArray(materials) || materials.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Roof type and materials array are required.",
            });
        }

        // Validate materials structure
        materials.forEach(material => {
            if (!material.name || material.cost <= 0 || !material.id) {
                throw new Error("Each material must have a name, a valid cost, and an ID.");
            }
        });

        // Check if the roofType already exists
        const roofTypeQuery = query(collection(fireDB, "materials"), where("roofType", "==", roofType));
        const querySnapshot = await getDocs(roofTypeQuery);

        if (!querySnapshot.empty) {
            // Roof type exists, so we update the existing entry
            const docRef = querySnapshot.docs[0]; // Get the first document
            const existingMaterials = docRef.data().materials || [];

            // Merge new materials with existing materials (replace if name matches)
            const updatedMaterials = [...existingMaterials];
            materials.forEach(newMaterial => {
                const existingIndex = updatedMaterials.findIndex(
                    material => material.name === newMaterial.name
                );
                if (existingIndex !== -1) {
                    // Replace existing material with the new one
                    updatedMaterials[existingIndex] = newMaterial;
                } else {
                    // Add new material if it doesn't exist
                    updatedMaterials.push(newMaterial);
                }
            });

            // Update the document with the new materials list
            await updateDoc(docRef.ref, { materials: updatedMaterials });

            return NextResponse.json({
                success: true,
                message: "Materials updated successfully.",
            });
        } else {
            // Roof type does not exist, create a new document
            const materialsCollection = collection(fireDB, "materials");
            const docRef = await addDoc(materialsCollection, { roofType, materials });

            return NextResponse.json({
                success: true,
                data: { id: docRef.id, roofType, materials },
            });
        }
    } catch (error) {
        console.error("Error in POST request:", error);
        return NextResponse.json({ success: false, message: "Error adding or updating material." });
    }
}



export async function PUT(req: Request) {
    try {
        const { id, roofType, materials } = await req.json();

        // Validation
        if (!id || !roofType || !Array.isArray(materials) || materials.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Material ID, roof type, and materials array are required.",
            });
        }

        // Validate materials structure
        materials.forEach(material => {
            if (!material.name || material.cost <= 0 || !material.id) {
                throw new Error("Each material must have a name, a valid cost, and an ID.");
            }
        });

        const materialDoc = doc(fireDB, "materials", id);

        // Fetch the existing materials from Firestore
        const docSnapshot = await getDoc(materialDoc);
        if (!docSnapshot.exists()) {
            return NextResponse.json({
                success: false,
                message: "Document not found.",
            });
        }

        const existingMaterials = docSnapshot.data().materials || [];

        // Validate that no material ID is being changed
        const idMismatch = materials.some(newMaterial => {
            const existingMaterial = existingMaterials.find((m: { id: any; }) => m.id === newMaterial.id);
            return !existingMaterial; // If the new material ID doesn't exist in Firestore
        });

        if (idMismatch) {
            return NextResponse.json({
                success: false,
                message: "Material ID mismatch. Material IDs cannot be changed.",
            });
        }

        // Prepare updated materials
        const updatedMaterials = materials.map(material => ({
            id: material.id,  // Keep the id the same
            name: material.name,  // Update only the name
            cost: material.cost, // Keep the cost consistent
        }));

        // Update the document in Firestore
        await updateDoc(materialDoc, { roofType, materials: updatedMaterials });

        return NextResponse.json({
            success: true,
            data: { id, roofType, materials: updatedMaterials },
        });
    } catch (error) {
        console.error("Error updating material:", error);
        return NextResponse.json({ success: false, message: "Error updating material." });
    }
}



// Delete a material by ID
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();
        if (!id) {
            return new Response(JSON.stringify({ success: false, message: "Material ID is required." }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const materialDoc = doc(fireDB, "materials", id);
        await deleteDoc(materialDoc);
        return new Response(JSON.stringify({ success: true, message: "Material deleted successfully." }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: "Error deleting material." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
