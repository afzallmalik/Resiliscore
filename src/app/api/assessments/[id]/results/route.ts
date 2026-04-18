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

function toRangeSafe(value: any): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) return null;

  const min = Number(value[0]);
  const max = Number(value[1]);

  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  return [min, max];
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const overall_score = toNumberSafe(assessment.overallScore);
  const domain_scores_raw = (assessment.domainScores ?? []) as any[];
  const feedback = (assessment.feedback ?? {}) as any;

  const domain_scores = Array.isArray(domain_scores_raw)
    ? domain_scores_raw.map((d) => ({
        ...d,
        score: toNumberSafe(d?.score) ?? 0,
        risk_score: toNumberSafe(d?.risk_score) ?? null,
      }))
    : [];

  const compact = assessment.id.replace(/-/g, "").toUpperCase();
  const report_reference = `RS-${compact.slice(0, 8)}`;

  const top_breach_routes = Array.isArray(feedback?.topBreachRoutes)
    ? feedback.topBreachRoutes.filter(Boolean)
    : [];

  const priority_actions = Array.isArray(feedback?.priorityActions)
    ? feedback.priorityActions.map((a: any) => ({
        title: String(a?.title ?? "").trim(),
        why: String(a?.why ?? "").trim(),
        urgency: String(a?.urgency ?? "").trim(),
      }))
    : [];

  const financial_impact = feedback?.financialImpact
    ? {
        min: toNumberSafe(feedback.financialImpact?.min),
        max: toNumberSafe(feedback.financialImpact?.max),
        breakdown: {
          downtime: toRangeSafe(feedback.financialImpact?.breakdown?.downtime),
          lostRevenue: toRangeSafe(feedback.financialImpact?.breakdown?.lostRevenue),
          recovery: toRangeSafe(feedback.financialImpact?.breakdown?.recovery),
          reputational: toRangeSafe(feedback.financialImpact?.breakdown?.reputational),
        },
      }
    : null;

  const benchmark = feedback?.benchmark
    ? {
        more_secure_than: toNumberSafe(feedback.benchmark?.moreSecureThan),
        less_secure_than: toNumberSafe(feedback.benchmark?.lessSecureThan),
      }
    : null;

  const report_summary = feedback?.reportSummary
    ? {
        headline: String(feedback.reportSummary?.headline ?? "").trim(),
        why_it_matters: String(feedback.reportSummary?.whyItMatters ?? "").trim(),
      }
    : null;

  return NextResponse.json({
    id: assessment.id,
    created_at: assessment.createdAt,
    completed_at: assessment.completedAt,

    overall_score,
    grade: assessment.grade,
    risk_level: feedback?.riskLevel ?? null,

    domain_scores,

    top_breach_routes,
    priority_actions,
    financial_impact,
    benchmark,
    report_summary,

    interpretation:
      report_summary?.why_it_matters ??
      "This is an indicative risk snapshot based on your answers.",

    email: assessment.email ?? null,
    company_name: assessment.companyName ?? null,
    industry: assessment.industry ?? null,

    report_reference,
    report_tier: assessment.reportTier ?? "free",
    downloadToken: assessment.downloadToken ?? null,
  });
}