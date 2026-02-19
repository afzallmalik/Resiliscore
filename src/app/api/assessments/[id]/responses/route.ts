import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
  responses: z.array(z.object({
    q_id: z.string(),
    score: z.number().int().min(0).max(5).nullable(),
    notes: z.string().optional().nullable(),
  })).min(1),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const json = await req.json();
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const assessmentId = params.id;

  // Upsert responses in a transaction
  await prisma.$transaction(
    parsed.data.responses.map((r) =>
      prisma.response.upsert({
        where: { assessmentId_qId: { assessmentId, qId: r.q_id } },
        update: { score: r.score ?? null, notes: r.notes ?? null },
        create: { assessmentId, qId: r.q_id, score: r.score ?? null, notes: r.notes ?? null },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
