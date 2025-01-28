import { NextResponse } from "next/server";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore"; 
import { fireDB } from "@/config/firebase"; 

export async function POST(req: Request) {
  try {
    const { roofType, materials, email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!roofType || !materials || materials.length === 0) {
      return NextResponse.json(
        { error: "Roof Type and Materials are required." },
        { status: 400 }
      );
    }

    const updatedMaterials = materials.map((material: { name: string; cost: string | number }) => {
      const materialCost = typeof material.cost === "string" ? parseFloat(material.cost) : material.cost;

      if (isNaN(materialCost)) {
        throw new Error("Material cost must be a valid number.");
      }

      return {
        materialName: material.name,
        materialCost, 
      };
    });

    const emailQuery = query(collection(fireDB, "roofingData"), where("email", "==", email));
    const emailQuerySnapshot = await getDocs(emailQuery);

    let docRef;

    if (!emailQuerySnapshot.empty) {
      const docId = emailQuerySnapshot.docs[0].id;
      docRef = doc(fireDB, "roofingData", docId); 
      await updateDoc(docRef, {
        roofTypeName: roofType,
        materials: updatedMaterials,
      });
      return NextResponse.json(
        { message: "Data updated successfully", payload: { roofType, materials: updatedMaterials } },
        { status: 200 }
      );
    } else {
      docRef = await addDoc(collection(fireDB, "roofingData"), {
        roofTypeName: roofType,
        materials: updatedMaterials,
        email,
      });
      return NextResponse.json(
        { message: "Data added successfully", payload: { roofType, materials: updatedMaterials } },
        { status: 200 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "An internal server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email query parameter is required." },
        { status: 400 }
      );
    }

    const emailQuery = query(collection(fireDB, "roofingData"), where("email", "==", email));
    const emailQuerySnapshot = await getDocs(emailQuery);

    if (emailQuerySnapshot.empty) {
      return NextResponse.json(
        { error: "No data found for this email." },
        { status: 404 }
      );
    }

    const emailData = emailQuerySnapshot.docs[0].data();

    return NextResponse.json(
      { message: "Data fetched successfully", data: emailData },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "An internal server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}