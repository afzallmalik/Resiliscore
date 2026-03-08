// src/app/api/questions/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACTIVE_MODEL_VERSION, DOMAINS_V13, DOMAIN_ORDER_BY_CODE } from "@/lib/domains";

export async function GET() {
  const rows = await prisma.question.findMany({
    where: { modelVersion: ACTIVE_MODEL_VERSION },
    orderBy: [{ domain: "asc" }, { order: "asc" }],
    select: {
      id: true,
      domain: true,
      order: true,
      prompt: true,
      helpText: true,
      modelVersion: true,
      mapping: true,
    },
  });

  if (!rows.length) {
    return NextResponse.json(
      {
        ok: false,
        error: `No questions found for modelVersion "${ACTIVE_MODEL_VERSION}".`,
        fix: `Seed "${ACTIVE_MODEL_VERSION}" into Supabase OR change ACTIVE_MODEL_VERSION in src/lib/domains.ts to one that exists.`,
      },
      { status: 500 }
    );
  }

  // Use registry order (fixed), not DB-derived
  const domains = DOMAINS_V13.map((d) => ({
    code: d.code,
    name: d.code,
    order: d.order,
  }));

  const questions = rows.map((q) => ({
    id: q.id,
    domain_code: q.domain,
    domain_name: q.domain,
    domain_order: DOMAIN_ORDER_BY_CODE[q.domain] ?? 999,
    question_number: q.order,
    text: q.prompt,
    help_text: q.helpText ?? "",
    mapping: q.mapping ?? null,
  }));

  return NextResponse.json({
    ok: true,
    modelVersion: ACTIVE_MODEL_VERSION,
    domains,
    questions,
  });
}