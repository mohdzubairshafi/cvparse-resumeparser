import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // getting current clerk user
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "user not found in clerk " },
        { status: 404 }
      );
    }

    let email = "";
    if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
      email = clerkUser.emailAddresses[0].emailAddress || "";
    }
    // check if user has profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });
    // check
    if (existingProfile) {
      return NextResponse.json({
        message: "profile already exists.",
      });
    }

    // here we are then ew have to create new profile

    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        stripeSubscriptionId: null,
        subscriptionTier: null,
        subscriptionActive: false,
      },
    });

    return NextResponse.json(
      { message: "profile created successfully " },
      { status: 201 }
    );
  } catch (e) {
    console.error("Error in /api/create-profile:", e);
    return NextResponse.json(
      {
        error: "internal error",
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
