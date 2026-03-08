export type DomainScore = { domain_code: string; domain_name: string; score: number };

export function gradeFromOverall(overall: number): "A" | "B" | "C" | "D" | "E" {
  if (overall >= 4.5) return "A";
  if (overall >= 3.5) return "B";
  if (overall >= 2.5) return "C";
  if (overall >= 1.5) return "D";
  return "E";
}

export function computeScores(params: {
  domains: { code: string; name: string; order: number }[];
  questions: { id: string; domain_code: string }[];
  responses: Record<string, { score: number | null }>;
}): { domainScores: DomainScore[]; overallScore: number; grade: "A" | "B" | "C" | "D" | "E" } {
  const { domains, questions, responses } = params;

  const byDomain: Record<string, number[]> = {};
  for (const d of domains) byDomain[d.code] = [];

  for (const q of questions) {
    const r = responses[q.id];
    if (!r || r.score === null || Number.isNaN(r.score)) continue;

    const code = q.domain_code;

    // Defensive init so we never crash
    if (!byDomain[code]) byDomain[code] = [];

    byDomain[code].push(r.score);
  }

  const domainScores: DomainScore[] = domains
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((d) => {
      const scores = byDomain[d.code] ?? [];
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { domain_code: d.code, domain_name: d.name, score: Number(avg.toFixed(2)) };
    });

  const overall = domainScores.length
    ? domainScores.reduce((a, b) => a + b.score, 0) / domainScores.length
    : 0;

  const overallScore = Number(overall.toFixed(2));
  const grade = gradeFromOverall(overallScore);

  return { domainScores, overallScore, grade };
}