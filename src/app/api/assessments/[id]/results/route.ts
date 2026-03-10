// src/app/api/assessments/[id]/results/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toNumberSafe(v: any): number | null {
  if (v === null || v === undefined) return null;

  if (typeof v === "object" && typeof v.toString === "function") {
    const n = Number(v.toString());
    return Number.isFinite(n) ? n : null;
  }

  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const assessment = await prisma.assessment.findUnique({ where: { id: params.id } });
  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const overall_score = toNumberSafe(assessment.overallScore);
  const domain_scores_raw = (assessment.domainScores ?? []) as any[];

  const domain_scores = Array.isArray(domain_scores_raw)
    ? domain_scores_raw.map((d) => ({
        ...d,
        score: toNumberSafe(d?.score) ?? 0,
      }))
    : [];

  const compact = assessment.id.replace(/-/g, "").toUpperCase();
  const report_reference = `RS-${compact.slice(0, 8)}`;

  return NextResponse.json({
    id: assessment.id,
    created_at: assessment.createdAt,
    completed_at: assessment.completedAt,
    overall_score,
    grade: assessment.grade,
    domain_scores,
    email: assessment.email ?? null,
    company_name: assessment.companyName ?? null,
    industry: assessment.industry ?? null,
    report_reference,
    report_tier: assessment.reportTier ?? "free",
    downloadToken: assessment.downloadToken ?? null,
  });
}