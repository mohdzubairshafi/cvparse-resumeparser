import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // adjust path if needed
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  // console.log(" WE ARE in api/stats route --->\n");

  try {
    const {
      userId,
      tokensPrompt = 0,
      tokensCompletion = 0,
      totalTokens = 0,
    } = await req.json();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const updatedStats = await prisma.resumeParseStats.upsert({
      where: { userId },
      update: {
        resumesParsed: { increment: 1 },
        tokensPrompt: { increment: tokensPrompt },
        tokensCompletion: { increment: tokensCompletion },
        totalTokens: { increment: totalTokens },
        updatedAt: new Date(),
      },
      create: {
        userId,
        resumesParsed: 1,
        tokensPrompt,
        tokensCompletion,
        totalTokens,
      },
    });

    return NextResponse.json({ success: true, stats: updatedStats });
  } catch (error) {
    console.error("[POST /api/stats]", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stats = await prisma.resumeParseStats.findUnique({
      where: { userId },
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("[GET /api/stats]", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
