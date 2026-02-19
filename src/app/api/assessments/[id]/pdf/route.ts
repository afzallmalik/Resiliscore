import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function loadActionsForDomains(domainCodes: string[]) {
  const p = path.join(process.cwd(), "data", "actions.v1.json");
  const raw = fs.readFileSync(p, "utf-8");
  const actions = JSON.parse(raw) as { rules?: { domain_code: string; actions?: string[] }[] };
  const ruleMap = new Map<string, string[]>();
  for (const r of actions.rules ?? []) ruleMap.set(r.domain_code, r.actions ?? []);

  const out: string[] = [];
  for (const code of domainCodes) out.push(...(ruleMap.get(code) ?? []));
  return Array.from(new Set(out));
}

function wrapText(text: string, maxLen: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line: string[] = [];
  let len = 0;
  for (const w of words) {
    const extra = line.length ? 1 : 0;
    if (len + w.length + extra > maxLen) {
      lines.push(line.join(" "));
      line = [w];
      len = w.length;
    } else {
      line.push(w);
      len += w.length + extra;
    }
  }
  if (line.length) lines.push(line.join(" "));
  return lines;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { responses: true },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const overall = (assessment as any).overall_score ?? 0;
  const grade = (assessment as any).grade ?? "-";
  const domainScores = (assessment as any).domain_scores ?? [];
  const interpretation =
    (assessment as any).interpretation ??
    "This is an indicative cyber resilience snapshot based on your responses.";
  const domainCodes = (Array.isArray(domainScores) ? domainScores : [])
    .map((d: any) => d.code)
    .filter(Boolean);

  const actions = loadActionsForDomains(domainCodes).slice(0, 12);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;

  page.drawText("Resiliscore — Cyber Resilience Maturity Assessment", {
    x: 50,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.08),
  });
  y -= 24;

  page.drawText(`Assessment ID: ${id}`, {
    x: 50,
    y,
    size: 9,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 22;

  page.drawText("Summary", { x: 50, y, size: 12, font: fontBold });
  y -= 16;

  page.drawText(`Overall score: ${overall}`, { x: 50, y, size: 11, font });
  page.drawText(`Grade: ${grade}`, { x: 220, y, size: 11, font });
  y -= 18;

  page.drawText("What this means (plain English)", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
  });
  y -= 14;
  for (const line of wrapText(String(interpretation), 90)) {
    page.drawText(line, { x: 50, y, size: 10, font });
    y -= 12;
    if (y < 80) break;
  }
  y -= 8;

  page.drawText("Domain scores", { x: 50, y, size: 11, font: fontBold });
  y -= 14;

  const ds = Array.isArray(domainScores) ? domainScores : [];
  for (const d of ds.slice(0, 14)) {
    const name = d.name ?? d.code ?? "Domain";
    const score = d.score ?? 0;
    const rag = d.rag ?? "-";
    page.drawText(`${name}`, { x: 50, y, size: 10, font });
    page.drawText(`Score: ${score}`, { x: 350, y, size: 10, font });
    page.drawText(`RAG: ${rag}`, { x: 450, y, size: 10, font });
    y -= 12;
    if (y < 160) break;
  }

  y -= 10;

  page.drawText("High-level recommendations (next 90 days)", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
  });
  y -= 14;

  let i = 1;
  for (const a of actions) {
    const lines = wrapText(`${i}. ${a}`, 92);
    for (const line of lines) {
      page.drawText(line, { x: 50, y, size: 10, font });
      y -= 12;
      if (y < 60) break;
    }
    if (y < 60) break;
    i += 1;
  }

  page.drawText("Resiliscore (MVP) — indicative results. For guidance only.", {
    x: 50,
    y: 30,
    size: 8,
    font,
    color: rgb(0.45, 0.45, 0.45),
  });

  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resiliscore-${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
