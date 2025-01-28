import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
} as unknown as Stripe.StripeConfig);

// Define the response type
interface PaymentResponse {
  customerId: string;
  email: string | null;
  paymentIntentId: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  paymentMethodId?: string; // Add this line to include paymentMethodId in the response
  active?: boolean;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    // Retrieve customer
    const customers = await stripe.customers.list({
      email,
      limit: 1,
    });
    let customer = customers.data[0];
    if (!customer) {
      // Create a new customer if not found
      customer = await stripe.customers.create({
        email,
      });
    }

    // Fetch payment intents associated with the customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customer.id, // Filter by customer ID
      limit: 10, // Adjust limit based on your needs
    });
    if (paymentIntents.data.length === 0) {
      return NextResponse.json(
        { error: "No payment found for this customer." },
        { status: 404 }
      );
    }

    // Return the most recent payment intent
    const latestPayment = paymentIntents.data[0];
    const response: PaymentResponse = {
      customerId: customer.id,
      email: latestPayment.receipt_email || customer.email,
      paymentIntentId: latestPayment.id,
      paymentStatus: latestPayment.status,
      amount: latestPayment.amount / 100, // Convert cents to dollars
      currency: latestPayment.currency,
    };

    // Extract payment method ID (if available)
    if (latestPayment.payment_method && typeof latestPayment.payment_method === "string") {
      response.paymentMethodId = latestPayment.payment_method;
    }

    // If payment succeeded, include active: true
    if (latestPayment.status === "succeeded") {
      response.active = true;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}
