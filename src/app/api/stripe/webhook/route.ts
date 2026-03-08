import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature) {
      console.error("Webhook error: missing stripe-signature header");
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error("Webhook error: missing STRIPE_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err?.message);
      return NextResponse.json(
        {
          error: "Invalid signature",
          detail: err?.message ?? "Unknown signature error",
        },
        { status: 400 }
      );
    }

    console.log("Webhook event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const assessmentId = session.metadata?.assessmentId;

      console.log("checkout.session.completed metadata:", session.metadata);

      if (!assessmentId) {
        console.error("Webhook error: missing assessmentId in metadata");
        return NextResponse.json(
          { error: "Missing assessmentId in metadata" },
          { status: 400 }
        );
      }

      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          reportTier: "premium",
        },
      });

      console.log(`Assessment ${assessmentId} upgraded to premium`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook fatal error:", err);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        detail: err?.message ?? "Unknown webhook error",
      },
      { status: 500 }
    );
  }
}