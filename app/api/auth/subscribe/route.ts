import { NextResponse } from "next/server";
import { fireDB } from "@/config/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Stripe from "stripe";

// Assuming you have your Stripe API initialized elsewhere in the project
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
} as unknown as Stripe.StripeConfig);

export async function POST(request: Request) {
  try {
    const { email, subscribe, paymentIntentId } = await request.json();

    // Validate the inputs
    if (!email || typeof subscribe !== "boolean") {
      return NextResponse.json(
        { error: "Email and subscribe status are required." },
        { status: 400 }
      );
    }

    if (paymentIntentId !== null && typeof paymentIntentId !== "string") {
      return NextResponse.json(
        { error: "paymentIntentId must be a string or null." },
        { status: 400 }
      );
    }

    // Fetch the customer from Stripe by email
    const customers = await stripe.customers.list({ email });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "No customer found with the provided email." },
        { status: 404 }
      );
    }

    const customer = customers.data[0]; // Get the first customer with this email
    const customerId = customer.id; // Get the customer ID

    // Fetch the user from Firestore by email
    const usersRef = collection(fireDB, "users");
    const userQuery = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(userQuery);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "User with the provided email does not exist." },
        { status: 404 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(fireDB, "users", userDoc.id);

    // Update the user's subscription status, paymentIntentId, and customerId in Firestore
    await updateDoc(userRef, {
      subscribe,
      paymentIntentId: paymentIntentId || null,
      customerId: customerId || null, // Save customerId to Firestore
    });

    return NextResponse.json(
      { message: "Subscription status, paymentIntentId, and customerId updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "An error occurred while updating the subscription status." },
      { status: 500 }
    );
  }
}
