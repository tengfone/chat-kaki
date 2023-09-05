import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });
      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    // First time
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      mode: "subscription",
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "SGD",
            product_data: {
              name: "Kaki Pro",
              description: "Create custom AI Kaki",
            },
            unit_amount: 499, //$4.99
            recurring: {
              interval: "week",
            },
          },
        },
      ],
      metadata: {
        // inside stripe metadata, user ID.
        userId,
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (err) {
    console.log("[STRIPE_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
