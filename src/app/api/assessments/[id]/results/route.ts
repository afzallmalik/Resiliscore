import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const assessment = await prisma.assessment.findUnique({ where: { id: params.id } });
  if (!assessment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: assessment.id,
    created_at: assessment.createdAt,
    completed_at: assessment.completedAt,
    overall_score: assessment.overallScore,
    grade: assessment.grade,
    domain_scores: assessment.domainScores,
  });
}
