import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadQuestionSet } from "@/lib/questions";
import { computeScores } from "@/lib/scoring";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const assessmentId = params.id;
  const { domains, questions } = loadQuestionSet();

  const rows = await prisma.response.findMany({ where: { assessmentId } });
  const responses: Record<string, { score: number | null }> = {};
  for (const r of rows) responses[r.qId] = { score: r.score };

  const { domainScores, overallScore, grade } = computeScores({ domains, questions, responses });

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      overallScore,
      grade,
      domainScores: domainScores as any,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, overallScore, grade, domainScores });
}
