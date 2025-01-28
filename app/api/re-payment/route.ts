import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-11-15",
  } as unknown as Stripe.StripeConfig);

export async function POST(req: Request) {
  try {
    const { customerId, amount, currency, paymentMethodId } = await req.json();

    if (!customerId || !amount || !currency || !paymentMethodId) {
      return NextResponse.json(
        { error: "Missing required fields: customerId, amount, currency, or paymentMethodId." },
        { status: 400 }
      );
    }

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      payment_method: paymentMethod.id,
      payment_method_types: ["card"],
      off_session: true, 
      confirm: true, 
    });

    return NextResponse.json(
      {
        message: "Payment successful!",
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process the payment." },
      { status: 500 }
    );
  }
}
