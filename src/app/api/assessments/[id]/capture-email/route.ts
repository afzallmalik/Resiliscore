import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { email } = await req.json();

    const clean = String(email ?? "").trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const updated = await prisma.assessment.update({
      where: { id: params.id },
      data: {
        email: clean,
        emailCapturedAt: new Date(),
      },
      select: { email: true, emailCapturedAt: true, reportTier: true },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: "Failed", detail: String(e?.message ?? e) }, { status: 500 });
  }
}