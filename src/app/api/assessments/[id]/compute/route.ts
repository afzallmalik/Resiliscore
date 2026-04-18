export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScores } from "@/lib/scoring";

type ComputedDomainScore = {
  domain_code?: string;
  domain_name?: string;
  score?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreBand(score: number): "very_low" | "low" | "mid" | "high" | "very_high" {
  if (score < 1.0) return "very_low";
  if (score < 2.0) return "low";
  if (score < 3.0) return "mid";
  if (score < 4.0) return "high";
  return "very_high";
}

function getRiskLevelFromOverall(overall: number): "High" | "Medium" | "Low" {
  if (overall < 2.25) return "High";
  if (overall < 3.5) return "Medium";
  return "Low";
}

function getDomainWeight(domainName: string) {
  const key = domainName.toLowerCase();

  if (key.includes("identity") || key.includes("access")) return 1.35;
  if (key.includes("recovery") || key.includes("backup") || key.includes("resilience")) return 1.35;
  if (key.includes("threat") || key.includes("vulnerability")) return 1.25;
  if (key.includes("incident") || key.includes("response")) return 1.2;
  if (key.includes("operations")) return 1.15;
  if (key.includes("supplier") || key.includes("third")) return 1.1;
  if (key.includes("asset") || key.includes("data")) return 1.05;
  if (key.includes("risk") || key.includes("compliance")) return 1.0;
  if (key.includes("governance")) return 1.0;

  return 1.0;
}

function getBreachRoute(domainName: string) {
  const key = domainName.toLowerCase();

  if (key.includes("identity") || key.includes("access")) {
    return "Email or account compromise";
  }

  if (key.includes("recovery") || key.includes("backup") || key.includes("resilience")) {
    return "Data loss or ransomware with slow recovery";
  }

  if (key.includes("incident") || key.includes("response")) {
    return "Longer downtime because nobody responds quickly enough";
  }

  if (key.includes("threat") || key.includes("vulnerability")) {
    return "Attack through outdated software or known weaknesses";
  }

  if (key.includes("operations")) {
    return "Operational disruption from weak day-to-day security routines";
  }

  if (key.includes("supplier") || key.includes("third")) {
    return "Third-party or supplier weakness";
  }

  if (key.includes("asset") || key.includes("data")) {
    return "Sensitive data exposure or poor system visibility";
  }

  if (key.includes("risk") || key.includes("compliance")) {
    return "Known issues being left unresolved for too long";
  }

  if (key.includes("governance")) {
    return "Important security gaps not being owned clearly";
  }

  return "A preventable cyber incident through common weaknesses";
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values));
}

function getPriorityAction(domainName: string, band: ReturnType<typeof scoreBand>) {
  const key = domainName.toLowerCase();

  if (key.includes("identity") || key.includes("access")) {
    return {
      title: "Enable multi-factor authentication on all email and key business accounts",
      why: "This blocks one of the most common ways small businesses are breached.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("recovery") || key.includes("backup") || key.includes("resilience")) {
    return {
      title: "Back up your data daily to a separate system and test recovery",
      why: "This reduces downtime and damage if files are lost or encrypted.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("threat") || key.includes("vulnerability")) {
    return {
      title: "Make sure all business devices and systems update automatically",
      why: "Attackers often exploit known weaknesses that already have fixes available.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("incident") || key.includes("response")) {
    return {
      title: "Create a simple plan for what to do if something goes wrong",
      why: "Fast, clear action reduces downtime, confusion, and cost.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("operations")) {
    return {
      title: "Put basic day-to-day security routines in place for devices, users, and data",
      why: "Simple routines prevent small gaps from becoming expensive incidents.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("supplier") || key.includes("third")) {
    return {
      title: "Review which suppliers can access your systems or data",
      why: "A weak supplier can still create major disruption for your business.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("asset") || key.includes("data")) {
    return {
      title: "List your key systems and sensitive data so you know what must be protected first",
      why: "You cannot protect or recover what you cannot quickly identify.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("risk") || key.includes("compliance")) {
    return {
      title: "Track your main security risks and assign an owner to each one",
      why: "Known problems often stay open too long when nobody owns them clearly.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  if (key.includes("governance")) {
    return {
      title: "Assign one person to own cyber risk and review progress monthly",
      why: "Clear ownership is one of the fastest ways to reduce avoidable gaps.",
      urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
    };
  }

  return {
    title: "Fix the biggest gap in this area first and assign clear ownership",
    why: "The fastest improvements come from fixing the weakest points before attackers find them.",
    urgency: band === "very_low" || band === "low" ? "Urgent" : "Important",
  };
}

function estimateFinancialImpact(overall: number, companyName?: string | null, industry?: string | null) {
  let min = 8000;
  let max = 45000;

  const industryKey = String(industry ?? "").toLowerCase();
  const companyKey = String(companyName ?? "");

  if (
    industryKey.includes("manufacturing") ||
    industryKey.includes("health") ||
    companyKey.length > 22
  ) {
    min = 12000;
    max = 65000;
  }

  if (overall < 2.0) {
    min = Math.round(min * 1.4);
    max = Math.round(max * 1.5);
  } else if (overall < 3.0) {
    min = Math.round(min * 1.1);
    max = Math.round(max * 1.15);
  } else if (overall >= 4.0) {
    min = Math.round(min * 0.55);
    max = Math.round(max * 0.55);
  } else if (overall >= 3.5) {
    min = Math.round(min * 0.75);
    max = Math.round(max * 0.75);
  }

  return {
    min,
    max,
    breakdown: {
      downtime: [Math.round(min * 0.22), Math.round(max * 0.24)],
      lostRevenue: [Math.round(min * 0.28), Math.round(max * 0.3)],
      recovery: [Math.round(min * 0.32), Math.round(max * 0.34)],
      reputational: [Math.round(min * 0.18), Math.round(max * 0.12)],
    },
  };
}

function getBenchmarkPercentile(overall: number) {
  const moreSecureThan = clamp(Math.round(((overall - 0.5) / 4.5) * 100), 5, 95);
  const lessSecureThan = 100 - moreSecureThan;

  return {
    moreSecureThan,
    lessSecureThan,
  };
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const assessmentId = params.id;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      model: true,
      companyName: true,
      industry: true,
    },
  });

  if (!assessment) {
    return NextResponse.json({ ok: false, error: "Assessment not found" }, { status: 404 });
  }

  const modelVersion = assessment.model ?? "v1.3";

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

  const domainMap = new Map<string, { code: string; name: string; order: number }>();
  let idx = 1;

  for (const q of qRows) {
    if (!domainMap.has(q.domain)) {
      domainMap.set(q.domain, { code: q.domain, name: q.domain, order: idx++ });
    }
  }

  const domains = Array.from(domainMap.values());

  const questions = qRows.map((q) => ({
    id: q.id,
    domain_code: q.domain,
  }));

  const rows = await prisma.response.findMany({
    where: { assessmentId },
    select: { qId: true, score: true },
  });

  const responses: Record<string, { score: number | null }> = {};
  for (const r of rows) {
    responses[r.qId] = { score: r.score };
  }

  const { domainScores, overallScore, grade } = computeScores({
    domains,
    questions,
    responses,
  });

  const safeDomainScores = (Array.isArray(domainScores) ? domainScores : []).map((d: ComputedDomainScore) => {
    const domain_name = String(d.domain_name ?? d.domain_code ?? "").trim();
    const score = Number(d.score ?? 0);
    const weight = getDomainWeight(domain_name);
    const riskScore = Number(((5 - score) * weight).toFixed(2));

    return {
      ...d,
      domain_name,
      score,
      risk_score: riskScore,
      breach_route: getBreachRoute(domain_name),
      risk_band: scoreBand(score),
    };
  });

  const rankedByRisk = [...safeDomainScores].sort((a, b) => Number(b.risk_score ?? 0) - Number(a.risk_score ?? 0));
  const rankedByWeakness = [...safeDomainScores].sort((a, b) => Number(a.score ?? 0) - Number(b.score ?? 0));

  const topBreachRoutes = uniqueStrings(
    rankedByRisk.slice(0, 3).map((d) => String(d.breach_route ?? ""))
  ).filter(Boolean);

  const priorityActions = rankedByWeakness.slice(0, 5).map((d) =>
    getPriorityAction(String(d.domain_name ?? ""), scoreBand(Number(d.score ?? 0)))
  );

  const riskLevel = getRiskLevelFromOverall(Number(overallScore ?? 0));
  const financialImpact = estimateFinancialImpact(
    Number(overallScore ?? 0),
    assessment.companyName ?? null,
    assessment.industry ?? null
  );

  const benchmark = getBenchmarkPercentile(Number(overallScore ?? 0));

  const feedback = {
    version: "smb_risk_v1",
    riskLevel,
    topBreachRoutes,
    financialImpact,
    benchmark,
    priorityActions,
    reportSummary: {
      headline:
        riskLevel === "High"
          ? "Your business appears exposed to common cyber risks that could cause avoidable cost and disruption."
          : riskLevel === "Medium"
          ? "Your business has some protection in place, but there are still gaps that could lead to disruption or expense."
          : "Your business appears better protected than many small businesses, but there are still a few gaps worth fixing.",
      whyItMatters:
        "Small businesses are often breached through simple weaknesses first. This report focuses on where you are most exposed, what the likely impact could be, and what to fix in the next 90 days.",
    },
    scoredAt: new Date().toISOString(),
  };

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      overallScore,
      grade,
      domainScores: safeDomainScores as any,
      feedback: feedback as any,
      completedAt: new Date(),
      model: modelVersion,
    },
  });

  return NextResponse.json({
    ok: true,
    modelVersion,
    overallScore,
    grade,
    riskLevel,
    domainScores: safeDomainScores,
    topBreachRoutes,
    financialImpact,
    benchmark,
    priorityActions,
  });
}