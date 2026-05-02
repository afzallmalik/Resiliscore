export type DomainScore = {
  domain_code: string;
  domain_name: string;
  score: number;
};

export function gradeFromOverall(overall: number): "A" | "B" | "C" | "D" | "E" {
  if (overall >= 4.5) return "A";
  if (overall >= 3.5) return "B";
  if (overall >= 2.5) return "C";
  if (overall >= 1.5) return "D";
  return "E";
}

/**
 * Optional weighting to reflect real-world breach likelihood
 * (used later by API layer, not changing core score)
 */
export function getDomainWeight(domainName: string): number {
  const key = domainName.toLowerCase();

  if (key.includes("identity") || key.includes("access")) return 1.35;
  if (key.includes("recovery") || key.includes("backup") || key.includes("resilience")) return 1.35;
  if (key.includes("threat") || key.includes("vulnerability")) return 1.25;
  if (key.includes("incident") || key.includes("response")) return 1.2;
  if (key.includes("operations")) return 1.15;
  if (key.includes("supplier") || key.includes("third")) return 1.1;
  if (key.includes("asset") || key.includes("data")) return 1.05;

  return 1.0;
}

/**
 * Convert score to simple band (used for risk messaging)
 */
export function scoreBand(score: number): "very_low" | "low" | "mid" | "high" | "very_high" {
  if (score < 1.0) return "very_low";
  if (score < 2.0) return "low";
  if (score < 3.0) return "mid";
  if (score < 4.0) return "high";
  return "very_high";
}

/**
 * Core scoring function (unchanged output)
 */
export function computeScores(params: {
  domains: { code: string; name: string; order: number }[];
  questions: { id: string; domain_code: string }[];
  responses: Record<string, { score: number | null }>;
}): {
  domainScores: DomainScore[];
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "E";
} {
  const { domains, questions, responses } = params;

  const byDomain: Record<string, number[]> = {};
  for (const d of domains) byDomain[d.code] = [];

  for (const q of questions) {
    const r = responses[q.id];
    if (!r || r.score === null || Number.isNaN(r.score)) continue;

    const code = q.domain_code;

    if (!byDomain[code]) byDomain[code] = [];

    byDomain[code].push(r.score);
  }

  const domainScores: DomainScore[] = domains
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((d) => {
      const scores = byDomain[d.code] ?? [];

      const avg = scores.length
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      return {
        domain_code: d.code,
        domain_name: d.name,
        score: Number(avg.toFixed(2)),
      };
    });

  const overall =
    domainScores.length > 0
      ? domainScores.reduce((a, b) => a + b.score, 0) / domainScores.length
      : 0;

  const overallScore = Number(overall.toFixed(2));
  const grade = gradeFromOverall(overallScore);

  return { domainScores, overallScore, grade };
}

/**
 * Helper used by results/PDF layers to consistently identify the weakest domains.
 * This does not change the core score; it only sorts and limits existing domain scores.
 */
export function getWeakestDomains(domainScores: DomainScore[], limit = 3): DomainScore[] {
  return domainScores
    .slice()
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

/**
 * Helper used where the product needs a practical action priority rather than a new score.
 * Lower maturity plus higher real-world exposure receives higher priority.
 */
export function getWeightedPriorityDomains(domainScores: DomainScore[], limit = 3): DomainScore[] {
  return domainScores
    .slice()
    .sort((a, b) => {
      const aPriority = (5 - a.score) * getDomainWeight(a.domain_name || a.domain_code);
      const bPriority = (5 - b.score) * getDomainWeight(b.domain_name || b.domain_code);
      return bPriority - aPriority;
    })
    .slice(0, limit);
}
