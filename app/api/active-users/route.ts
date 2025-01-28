import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15",
} as unknown as Stripe.StripeConfig);

export async function GET() {
  try {
    // Fetch all customers
    const customers = await stripe.customers.list();

    const activeUsers = [];

    // Loop through each customer to check for active subscriptions or one-time payments
    for (const customer of customers.data) {
      // Check for subscriptions first
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
      });

      const activeSubscription = subscriptions.data.find(
        (sub) => sub.status === "active" || sub.status === "trialing"
      );

      if (activeSubscription) {
        // Fetch the latest invoice for the active subscription
        const invoice = await stripe.invoices.retrieve(
          activeSubscription.latest_invoice as string
        );

        const paymentIntentId = invoice.payment_intent;
        let paymentStatus = "No payment made";
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId as string);
          paymentStatus = paymentIntent.status || "No payment made";
        }

        // Add the subscription user to active users list
        activeUsers.push({
          customerId: customer.id,
          email: customer.email,
          subscriptionDate: new Date(activeSubscription.created * 1000).toISOString(),
          subscriptionStatus: activeSubscription.status,
          paymentIntentId: paymentIntentId || "N/A",
          paymentStatus,
          subscriptionType: "subscription", // Marking this as a subscription-based payment
        });
      } else {
        // If no subscription, check for one-time payments (payment intents)
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customer.id,
          limit: 1, // Only take the most recent payment intent
        });

        const oneTimePayment = paymentIntents.data.find(
          (payment) => payment.status === "succeeded"
        );

        if (oneTimePayment) {
          activeUsers.push({
            customerId: customer.id,
            email: customer.email,
            subscriptionDate: new Date(oneTimePayment.created * 1000).toISOString(),
            subscriptionStatus: "one-time payment",
            paymentIntentId: oneTimePayment.id,
            paymentStatus: oneTimePayment.status || "No payment made",
            subscriptionType: "one-time", // Marking this as a one-time payment
          });
        }
      }
    }

    if (activeUsers.length === 0) {
      return NextResponse.json(
        { message: "No active users found." },
        { status: 404 }
      );
    }

    // Return all active users with their subscription or one-time payment data
    return NextResponse.json(
      { activeUsers },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "An internal server error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
