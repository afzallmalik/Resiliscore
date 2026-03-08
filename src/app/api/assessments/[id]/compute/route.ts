export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScores } from "@/lib/scoring";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const assessmentId = params.id;

  // 0) Load assessment so we compute using the SAME model version it was created with
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: { id: true, model: true },
  });

  if (!assessment) {
    return NextResponse.json({ ok: false, error: "Assessment not found" }, { status: 404 });
  }

  // If somehow model is missing, fall back to v1.3
  const modelVersion = assessment.model ?? "v1.3";

  // 1) Load questions from DB for that model version
  const qRows = await prisma.question.findMany({
    where: { modelVersion },
    orderBy: [{ domain: "asc" }, { order: "asc" }],
    select: { id: true, domain: true, order: true },
  });

  if (!qRows.length) {
    return NextResponse.json(
      { ok: false, error: `No questions found in DB for modelVersion ${modelVersion}` },
      { status: 500 }
    );
  }

  // 2) Build domains from DB
  const domainMap = new Map<string, { code: string; name: string; order: number }>();
  let idx = 1;

  for (const q of qRows) {
    if (!domainMap.has(q.domain)) {
      domainMap.set(q.domain, { code: q.domain, name: q.domain, order: idx++ });
    }
  }

  const domains = Array.from(domainMap.values());

  // 3) Minimal question shape for scoring
  const questions = qRows.map((q) => ({
    id: q.id,
    domain_code: q.domain,
  }));

  // 4) Load responses from DB
  const rows = await prisma.response.findMany({
    where: { assessmentId },
    select: { qId: true, score: true },
  });

  const responses: Record<string, { score: number | null }> = {};
  for (const r of rows) {
    responses[r.qId] = { score: r.score };
  }

  // 5) Compute scores
  const { domainScores, overallScore, grade } = computeScores({
    domains,
    questions,
    responses,
  });

  // 6) Persist results
  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      overallScore,
      grade,
      domainScores: domainScores as any,
      completedAt: new Date(),
      model: modelVersion, // keep model consistent
    },
  });

  return NextResponse.json({
    ok: true,
    modelVersion,
    overallScore,
    grade,
    domainScores,
  });
}