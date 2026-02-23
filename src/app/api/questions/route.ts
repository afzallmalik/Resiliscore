export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function cmpVersion(a: string, b: string) {
  // handles "v1.0", "v1.1", "v2.0" etc
  const pa = a.replace(/^v/i, "").split(".").map(Number);
  const pb = b.replace(/^v/i, "").split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da - db;
  }
  return 0;
}

export async function GET() {
  // Find latest modelVersion present
  const versions = await prisma.question.findMany({
    distinct: ["modelVersion"],
    select: { modelVersion: true },
  });

  const latest =
    versions
      .map((v) => v.modelVersion)
      .sort((a, b) => cmpVersion(a, b))
      .at(-1) ?? "v1.2";
      where: { modelVersion: latest }

  const questions = await prisma.question.findMany({
    where: { modelVersion: latest },
    orderBy: [{ domain: "asc" }, { order: "asc" }],
    select: {
      id: true,
      domain: true,
      order: true,
      prompt: true,
      helpText: true,
      modelVersion: true,
    },
  });

  // Domains list for your UI (order is by first appearance)
  const domainNames = Array.from(new Set(questions.map((q) => q.domain)));

  const domains = domainNames.map((d, idx) => ({
    code: d,
    name: d, // if later you add friendly names, map here
    order: idx + 1,
  }));

  return NextResponse.json({
    modelVersion: latest,
    domains,
    questions: questions.map((q) => ({
      id: q.id,
      domain_code: q.domain,
      domain_name: q.domain,
      domain_order: domains.find((x) => x.code === q.domain)?.order ?? 999,
      question_number: q.order,
      text: q.prompt,
      help_text: q.helpText,
      mapping: null,
    })),
  });
}