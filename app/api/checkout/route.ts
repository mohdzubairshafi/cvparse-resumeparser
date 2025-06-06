import { getPriceIDFromType } from "@/lib/plan";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { planType, userId: userID, email } = await request.json();
    // get from body

    const missingFields = [];
    if (!planType) missingFields.push("planType");
    if (!userID) missingFields.push("userID");
    if (!email) missingFields.push("email");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required field(s): ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // allowed plantype
    const allowedPlanTypes = ["week", "month", "year"];
    if (!allowedPlanTypes.includes(planType)) {
      return NextResponse.json(
        {
          error: "invalid plan type",
        },
        { status: 400 }
      );
    }

    const priceID = getPriceIDFromType(planType);

    if (!priceID) {
      return NextResponse.json(
        {
          error: "invalid price ... id ",
        },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceID,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: `${process.env.STRIPE_PUBLIC_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.STRIPE_PUBLIC_BASE_URL}/subscribe`,
      mode: "subscription",
      metadata: { clerkUserId: userID, planType },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("Error in /api/checkout:", e);
    return NextResponse.json(
      {
        error: "internal error",
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
