import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const emailFrom = process.env.EMAIL_FROM;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeSecretKey) {
      console.error("Webhook error: missing STRIPE_SECRET_KEY");
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    if (!webhookSecret) {
      console.error("Webhook error: missing STRIPE_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
    }

    if (!supabaseUrl) {
      console.error("Webhook error: missing NEXT_PUBLIC_SUPABASE_URL");
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL" }, { status: 500 });
    }

    if (!supabaseServiceRoleKey) {
      console.error("Webhook error: missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
    }

    if (!baseUrl) {
      console.error("Webhook error: missing NEXT_PUBLIC_APP_URL");
      return NextResponse.json({ error: "Missing NEXT_PUBLIC_APP_URL" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2026-02-25.clover",
    });

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("Webhook error: missing stripe-signature header");
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
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

      if (!assessmentId) {
        console.error("Webhook error: missing assessmentId in metadata");
        return NextResponse.json(
          { error: "Missing assessmentId in metadata" },
          { status: 400 }
        );
      }

      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!assessment) {
        console.error(`Webhook error: assessment not found for ${assessmentId}`);
        return NextResponse.json(
          { error: "Assessment not found" },
          { status: 404 }
        );
      }

      await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          reportTier: "premium",
          reportEmail: assessment.email ?? null,
        },
      });

      console.log(`Assessment ${assessmentId} upgraded to premium`);

      const pdfResponse = await fetch(
        `${baseUrl}/api/assessments/${assessmentId}/pdf`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!pdfResponse.ok) {
        const text = await pdfResponse.text();
        console.error("PDF generation call failed:", pdfResponse.status, text);
        return NextResponse.json(
          {
            error: "PDF generation failed after payment",
            detail: text,
          },
          { status: 500 }
        );
      }

      const updated = await prisma.assessment.findUnique({
        where: { id: assessmentId },
      });

      if (!updated?.reportUrl) {
        console.error("Webhook error: PDF generated but reportUrl not saved");
        return NextResponse.json(
          { error: "reportUrl missing after PDF generation" },
          { status: 500 }
        );
      }

      if (updated.email && resend && emailFrom) {
        const signed = await supabase.storage
          .from("reports")
          .createSignedUrl(updated.reportUrl, 60 * 60 * 24 * 7);

        if (signed.error || !signed.data?.signedUrl) {
          console.error("Signed URL creation failed:", signed.error);
          return NextResponse.json(
            { error: "Failed to create signed report URL" },
            { status: 500 }
          );
        }

        const emailResult = await resend.emails.send({
          from: emailFrom,
          to: updated.email,
          subject: "Your Resiliscore report is ready",
          html: `
            <p>Thank you for completing your Resiliscore assessment.</p>
            <p>Your payment was successful and your full report is now ready.</p>
            <p><a href="${signed.data.signedUrl}">Download your report</a></p>
            <p>This secure link will remain available for 7 days.</p>
            <p>If you have any problems, contact hello@resiliscore.co.uk.</p>
          `,
        });

        if ((emailResult as any)?.error) {
          console.error("Resend email failed:", (emailResult as any).error);
          return NextResponse.json(
            { error: "Email sending failed" },
            { status: 500 }
          );
        }

        await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            reportEmailSentAt: new Date(),
          },
        });

        console.log(`Report email sent for assessment ${assessmentId}`);
      } else {
        console.log(
          `Skipping email for assessment ${assessmentId} - missing email, EMAIL_FROM, or RESEND_API_KEY`
        );
      }
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