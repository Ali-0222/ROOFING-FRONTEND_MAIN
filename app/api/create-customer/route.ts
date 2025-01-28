import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
} as unknown as Stripe.StripeConfig);
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }
    // Create a customer
    const customer = await stripe.customers.create({
      email,
    });
    // Create a payment link (Note: customer cannot be directly associated with a payment link)
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: "price_1", // Replace with your actual price ID
          quantity: 1,
        },
      ],
      metadata: {
        customer_id: customer.id, // Store customer ID in metadata for future reference
      },
    });
    return NextResponse.json({ paymentLink: paymentLink.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}