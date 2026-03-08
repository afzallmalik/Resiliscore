// src/app/api/assessments/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ACTIVE_MODEL_VERSION } from "@/lib/domains";

const BodySchema = z.object({
  model: z.string().optional(),
  email: z.string().email().optional().nullable(),
  industry: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { model, email, industry } = parsed.data;

  // Single source of truth: default to ACTIVE_MODEL_VERSION
  const modelVersion = (model && model.trim()) ? model.trim() : ACTIVE_MODEL_VERSION;

  const a = await prisma.assessment.create({
    data: {
      model: modelVersion,
      email: email ?? null,
      industry: industry ?? null,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: a.id, modelVersion });
}