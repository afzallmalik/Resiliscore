import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Later you’ll replace this with Stripe webhook / payment verification.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { token } = await req.json();

    // TEMP: simple unlock token (replace later)
    if (token !== process.env.PREMIUM_UNLOCK_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const updated = await prisma.assessment.update({
      where: { id: params.id },
      data: { reportTier: "premium" },
      select: { reportTier: true },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: "Failed", detail: String(e?.message ?? e) }, { status: 500 });
  }
}