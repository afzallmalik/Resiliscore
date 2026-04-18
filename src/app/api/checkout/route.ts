import { NextResponse } from "next/server";
import Stripe from "stripe";

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

function getBaseUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json({ error: "Missing assessmentId" }, { status: 400 });
    }

    const priceId = process.env.STRIPE_PRICE_ID?.trim();
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRICE_ID in env" },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(req);
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      success_url: `${baseUrl}/results/${encodeURIComponent(assessmentId)}?upgraded=1`,
      cancel_url: `${baseUrl}/results/${encodeURIComponent(assessmentId)}`,

      allow_promotion_codes: true,

      billing_address_collection: "auto",

      metadata: {
        assessmentId,
        purchaseType: "full_report_unlock",
        product: "resiliscore_full_business_risk_report",
      },

      payment_intent_data: {
        metadata: {
          assessmentId,
          purchaseType: "full_report_unlock",
          product: "resiliscore_full_business_risk_report",
        },
        description: "Resiliscore Full Business Risk Report",
      },

      custom_text: {
        submit: {
          message:
            "One-time payment. No subscription. Unlock your full Resiliscore business risk report instantly after checkout.",
        },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.redirect(session.url, 303);
  } catch (err: any) {
    console.error("Checkout route error:", err);

    return NextResponse.json(
      {
        error: "Checkout creation failed",
        detail: err?.message ?? "Unknown checkout error",
      },
      { status: 500 }
    );
  }
}