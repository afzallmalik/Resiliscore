import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  return new Stripe(key, {
    apiVersion: "2026-02-25.clover",
  });
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: {
        id: true,
        reportTier: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    if ((assessment.reportTier ?? "free") === "premium") {
      return NextResponse.json({ ok: true, alreadyPremium: true });
    }

    const stripe = getStripe();

    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    const matched = sessions.data.find(
      (s) =>
        s.payment_status === "paid" &&
        s.metadata?.assessmentId === assessmentId
    );

    if (!matched) {
      return NextResponse.json(
        { ok: false, upgraded: false, message: "No paid session found yet" },
        { status: 404 }
      );
    }

    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        reportTier: "premium",
      },
    });

    return NextResponse.json({ ok: true, upgraded: true });
  } catch (err: any) {
    console.error("Confirm upgrade route error:", err);
    return NextResponse.json(
      {
        error: "Upgrade confirmation failed",
        detail: err?.message ?? "Unknown confirmation error",
      },
      { status: 500 }
    );
  }
}