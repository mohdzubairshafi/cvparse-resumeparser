// we listen strip webhook event
// like payment compterd failed
// and handel them

import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma"; // adjust path as per your project

export async function POST(request: NextRequest) {
  // geting strip raw body
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature || "",
      webhookSecret
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error instanceof Error && error.message) || String(error) },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "invoice.payment_failed": {
        const session = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(session);
        break;
      }

      case "customer.subscription.deleted": {
        const session = event.data.object as Stripe.Subscription;
        await handleCustomerSubscriptionDeleted(session);
        break;
      }

      default: {
        console.log("Unhandled event type ", event.type);
        break;
      }
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error instanceof Error && error.message) || String(error) },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: " Strip web hook running " });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  // console.log("✅ Checkout session completed:", session.id);

  const userId = session.metadata?.clerkUserId;
  if (!userId) {
    console.log("❌ No user id in session metadata");
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.log("❌ No subscription id in session");
    return;
  }

  try {
    // Update or create subscription record in your DB
    const updatedUser = await prisma.profile.update({
      where: { userId }, // assuming you store Clerk ID in your User model
      data: {
        stripeSubscriptionId: subscriptionId,
        subscriptionActive: true,
        subscriptionTier: session.metadata?.planType || null,
      },
    });

    // console.log(      `✅ Updated user ${updatedUser.id} with subscription ${subscriptionId}`    );
  } catch (error) {
    console.error("❌ Failed to update user in DB:", error);
  }
}
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Ensure the parent exists and is of type 'subscription_details'
  let subId;
  if (invoice.parent && invoice.parent.subscription_details) {
    // Proceed with subId
    subId = invoice.parent.subscription_details.subscription as string;
  }

  if (!subId) {
    console.log("No subscription ID on invoice");
    return;
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        stripeSubscriptionId: subId,
      },
      select: {
        userId: true,
      },
    });

    if (!profile?.userId) {
      console.log("No user profile found for subscription:", subId);
      return;
    }

    const userId = profile.userId;

    // ⚠️ Add your business logic here:
    // For example, mark the user as unpaid, disable features, send email, etc.
    console.log(`Payment failed for user ${userId}, subscription ${subId}`);

    // Example update:
    await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        subscriptionActive: false, //field to disable access
      },
    });

    console.log(`User ${userId} marked as inactive due to failed payment.`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

async function handleCustomerSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const subId = subscription.id;

  if (!subId) {
    console.log("No subscription ID on invoice");
    return;
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        stripeSubscriptionId: subId,
      },
      select: {
        userId: true,
      },
    });

    if (!profile?.userId) {
      console.log("No user profile found for subscription:", subId);
      return;
    }

    const userId = profile.userId;

    // ⚠️ Add your business logic here:
    // For example, mark the user as unpaid, disable features, send email, etc.
    console.log(`Payment failed for user ${userId}, subscription ${subId}`);

    // Example update:
    await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: {
        subscriptionActive: false, // example field to disable access
        stripeSubscriptionId: null,
        subscriptionTier: null,
      },
    });

    console.log(`User ${userId} marked as inactive due to failed payment.`);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}
