import fs from "fs";
import path from "path";

export type DomainScore = { domain_code: string; domain_name: string; score: number };

type ReportingJson = {
  modelVersion: string;
  brand: { productName: string; reportTitle: string; tagline: string };
  domains: Array<{
    code: string;
    short: string;
    why: string;
    signals: string[];
    goodLooksLike: string[];
    actionsByBand: Record<string, string[]>;
  }>;
};

function band(score: number): "0" | "1" | "2" | "3" | "4" | "5" {
  if (score < 0.5) return "0";
  if (score < 1.5) return "1";
  if (score < 2.5) return "2";
  if (score < 3.5) return "3";
  if (score < 4.5) return "4";
  return "5";
}

export function loadReportingConfig(modelVersion = "v1.3"): ReportingJson {
  const p = path.join(process.cwd(), "data", `reporting.${modelVersion}.json`);
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw) as ReportingJson;
}

export function buildDomainInsights(params: {
  modelVersion?: string;
  domainScores: DomainScore[];
}) {
  const modelVersion = params.modelVersion ?? "v1.3";
  const cfg = loadReportingConfig(modelVersion);

  const cfgByCode = new Map(cfg.domains.map((d) => [d.code, d]));
  const cfgByShort = new Map(cfg.domains.map((d) => [d.short, d]));

  // Normalise: match by code or short label
  const insights = cfg.domains.map((def) => {
    const found =
      params.domainScores.find((x) => x.domain_code === def.code) ??
      params.domainScores.find((x) => x.domain_name === def.code) ??
      params.domainScores.find((x) => x.domain_code === def.short) ??
      params.domainScores.find((x) => x.domain_name === def.short);

    const score = Number((found?.score ?? 0).toFixed(2));
    const b = band(score);
    const actions = def.actionsByBand[b] ?? [];

    return {
      code: def.code,
      short: def.short,
      score,
      band: b,
      why: def.why,
      signals: def.signals,
      goodLooksLike: def.goodLooksLike,
      actions,
    };
  });

  // Ranked lists for “top priorities / strengths”
  const ranked = [...insights].sort((a, b) => a.score - b.score);
  const risks = ranked.slice(0, 3);
  const strengths = ranked.slice(-3).reverse();

  return {
    brand: cfg.brand,
    modelVersion: cfg.modelVersion,
    insights,
    ranked,
    risks,
    strengths,
  };
}

export function buildExecutiveSummary(overallScore: number) {
  // Simple SME-friendly narrative
  if (overallScore < 1.5) {
    return [
      "Your results suggest controls are limited or not operating consistently in day-to-day practice.",
      "The fastest improvements usually come from ownership, access control (MFA/leavers), backups/restore testing, and a simple risk register.",
      "Focus on reducing disruption risk first, then build consistency and evidence."
    ];
  }
  if (overallScore < 2.5) {
    return [
      "Your organisation has some structure, but consistency and evidence may still be patchy.",
      "Prioritise the weakest domains first and convert key activities into repeatable routines with owners and dates.",
      "Add simple measurement (patch targets, restore success, response exercises) to move up maturity quickly."
    ];
  }
  if (overallScore < 3.5) {
    return [
      "You have defined practices, and the next maturity step is making controls consistently measurable and proven.",
      "Focus on assurance: testing, evidence, and metrics that show controls work as intended.",
      "Maintain strengths while lifting weaker areas to avoid creating new gaps."
    ];
  }
  return [
    "You have strong maturity foundations and are operating reliably across most domains.",
    "The main focus now is assurance, continuous improvement, and keeping standards high as the business changes.",
    "Use metrics and testing to prevent maturity drift over time."
  ];
}