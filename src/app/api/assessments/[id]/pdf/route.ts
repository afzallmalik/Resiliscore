// src/app/api/assessments/[id]/pdf/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic"
export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * ------------------------------
 * Brand + layout constants
 * ------------------------------
 */
const A4: [number, number] = [595.28, 841.89];

const BRAND = {
  headerBg: rgb(0.05, 0.14, 0.14),
  accent: rgb(0.36, 0.84, 0.46),
  text: rgb(0.10, 0.10, 0.10),
  muted: rgb(0.45, 0.45, 0.45),
  line: rgb(0.88, 0.88, 0.88),
  card: rgb(0.98, 0.98, 0.98),
};

/**
 * ------------------------------
 * Helpers: text safety (WinAnsi)
 * ------------------------------
 */
function sanitizeText(input: string) {
  return (input ?? "")
    .replace(/\u2192/g, "->")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x00-\x7F]/g, "");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreLabel(score: number) {
  if (score >= 4.5) return "Optimised";
  if (score >= 3.5) return "Managed";
  if (score >= 2.5) return "Defined";
  if (score >= 1.5) return "Repeatable";
  if (score >= 0.5) return "Ad hoc";
  return "Not in place";
}

function scoreBand(score: number): "very_low" | "low" | "mid" | "high" | "very_high" {
  if (score < 1.0) return "very_low";
  if (score < 2.0) return "low";
  if (score < 3.0) return "mid";
  if (score < 4.0) return "high";
  return "very_high";
}

function shortDomainLabel(domainNameOrCode: string) {
  const s = sanitizeText(domainNameOrCode || "").trim();

  const MAP: Record<string, string> = {
    "Governance & Leadership": "Governance",
    "Risk & Compliance": "Risk",
    "Asset & Data Management": "Asset",
    "Identity & Access Management": "Identity",
    "Secure Operations": "Operations",
    "Threat & Vulnerability Management": "Threat",
    "Incident Detection & Response": "Response",
    "Resilience & Recovery": "Recovery",
    "Third-Party & Supply Chain": "Suppliers",
  };

  if (MAP[s]) return MAP[s];

  const amp = s.split("&")[0]?.trim();
  if (amp) return amp.split(/\s+/)[0] || s;

  return s.split(/\s+/)[0] || s;
}

function wrapText(text: string, maxChars: number) {
  const safe = sanitizeText(text);
  const words = safe.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line: string[] = [];
  let len = 0;

  for (const w of words) {
    const extra = line.length ? 1 : 0;
    if (len + w.length + extra > maxChars) {
      if (line.length) lines.push(line.join(" "));
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

function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return sanitizeText(
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  );
}

function addPage(pdfDoc: PDFDocument) {
  return pdfDoc.addPage(A4);
}

function drawBrandHeader(page: any, shieldImg?: any) {
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: height - 58,
    width,
    height: 58,
    color: BRAND.headerBg,
  });

  if (shieldImg) {
    page.drawImage(shieldImg, {
      x: 32,
      y: height - 50,
      width: 30,
      height: 30,
      opacity: 0.95,
    });
  }
}

function drawFooter(page: any, pageNum: number, font: any, ref?: string) {
  const { width } = page.getSize();

  page.drawLine({
    start: { x: 40, y: 44 },
    end: { x: width - 40, y: 44 },
    thickness: 1,
    color: rgb(0.92, 0.92, 0.92),
  });

  page.drawText(sanitizeText(`Resiliscore Cyber Resilience Assessment Report`), {
    x: 40,
    y: 28,
    size: 8,
    font,
    color: BRAND.muted,
  });

  if (ref) {
    page.drawText(sanitizeText(`Ref: ${ref}`), {
      x: 245,
      y: 28,
      size: 8,
      font,
      color: BRAND.muted,
    });
  }

  page.drawText(sanitizeText(`hello@resiliscore.co.uk`), {
    x: 40,
    y: 16,
    size: 8,
    font,
    color: BRAND.muted,
  });

  page.drawText(sanitizeText(`Page ${pageNum}`), {
    x: width - 80,
    y: 28,
    size: 8,
    font,
    color: BRAND.muted,
  });
}

function drawWatermark(page: any, watermarkImg?: any, opacity = 0.12) {
  if (!watermarkImg) return;

  const { width, height } = page.getSize();
  const wmW = 420;
  const wmH = 420;
  const x = (width - wmW) / 2;
  const y = (height - wmH) / 2 - 20;

  page.drawImage(watermarkImg, {
    x,
    y,
    width: wmW,
    height: wmH,
    opacity: clamp(opacity, 0.02, 0.25),
  });
}

function drawSectionTitle(page: any, title: string, x: number, y: number, fontBold: any) {
  page.drawText(sanitizeText(title), { x, y, size: 12, font: fontBold, color: BRAND.text });
  page.drawLine({
    start: { x, y: y - 8 },
    end: { x: 545, y: y - 8 },
    thickness: 1,
    color: BRAND.line,
  });
}

function drawBar(page: any, x: number, y: number, w: number, h: number, pct: number) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    borderWidth: 1,
    borderColor: rgb(0.82, 0.82, 0.82),
    color: rgb(0.98, 0.98, 0.98),
  });

  const fillW = w * clamp(pct, 0, 1);
  page.drawRectangle({
    x,
    y,
    width: fillW,
    height: h,
    color: BRAND.accent,
  });
}

function drawTrafficLight(page: any, x: number, y: number, band: ReturnType<typeof scoreBand>, fontBold: any, font: any) {
  const r = 6;
  const gap = 18;

  const colors = {
    red: rgb(0.95, 0.35, 0.35),
    amber: rgb(0.98, 0.78, 0.30),
    green: rgb(0.36, 0.84, 0.46),
    grey: rgb(0.80, 0.80, 0.80),
  };

  const active =
    band === "very_low" || band === "low"
      ? "red"
      : band === "mid"
      ? "amber"
      : "green";

  page.drawText("Risk signal", {
    x,
    y: y + 12,
    size: 9,
    font: fontBold,
    color: BRAND.muted,
  });

  const c1 = active === "red" ? colors.red : colors.grey;
  const c2 = active === "amber" ? colors.amber : colors.grey;
  const c3 = active === "green" ? colors.green : colors.grey;

  page.drawCircle({ x: x + r, y, size: r, color: c1 });
  page.drawCircle({ x: x + r + gap, y, size: r, color: c2 });
  page.drawCircle({ x: x + r + gap * 2, y, size: r, color: c3 });

  const label =
    active === "red"
      ? "Higher disruption risk"
      : active === "amber"
      ? "Moderate risk"
      : "Lower risk (relative)";

  page.drawText(sanitizeText(label), {
    x: x + r + gap * 2 + 18,
    y: y - 3,
    size: 9,
    font,
    color: BRAND.muted,
  });
}

function loadActionsForDomains(domainCodes: string[]) {
  const p = path.join(process.cwd(), "data", "actions.v1.json");
  if (!fs.existsSync(p)) return [];

  const raw = fs.readFileSync(p, "utf-8");
  const actions = JSON.parse(raw) as { rules?: { domain_code: string; actions?: string[] }[] };

  const ruleMap = new Map<string, string[]>();
  for (const r of actions.rules ?? []) ruleMap.set(r.domain_code, r.actions ?? []);

  const out: string[] = [];
  for (const code of domainCodes) out.push(...(ruleMap.get(code) ?? []));

  return Array.from(new Set(out)).map(sanitizeText);
}

const DOMAIN_ANALYSIS: Record<
  string,
  { why: string; actions: Record<ReturnType<typeof scoreBand>, string[]> }
> = {
  "Governance & Leadership": {
    why: "Sets ownership, accountability and decision-making. Without it, controls drift and risks remain unmanaged.",
    actions: {
      very_low: [
        "Assign a named senior owner for cyber resilience.",
        "Start a monthly risk review with tracked actions.",
        "Document 3 core policies: access, backups, incident response.",
      ],
      low: [
        "Track actions with owners and due dates.",
        "Introduce a simple top-10 risk register.",
        "Define escalation and decision roles.",
      ],
      mid: [
        "Introduce a 1-page leadership dashboard (KPIs + priorities).",
        "Keep evidence: minutes, actions closed, exceptions.",
        "Review governance annually and after incidents.",
      ],
      high: [
        "Define KPIs and review trends quarterly.",
        "Test whether controls operate in practice.",
        "Extend governance to key suppliers and dependencies.",
      ],
      very_high: [
        "Run continuous improvement cycles (PDCA).",
        "Benchmark targets and keep assurance strong.",
        "Embed governance into business change.",
      ],
    },
  },
  "Risk & Compliance": {
    why: "Turns unknowns into a managed list with owners, priorities and evidence (supports due diligence).",
    actions: {
      very_low: [
        "Create a top-10 risk register.",
        "Assign owners for each risk.",
        "Define impact in business terms (money, downtime, legal, reputation).",
      ],
      low: [
        "Review risks monthly/quarterly.",
        "Track treatment actions to closure.",
        "Record accepted risks with sign-off and rationale.",
      ],
      mid: [
        "Set treatment timelines for high risks.",
        "Evidence progress and exceptions.",
        "Align top risks to key obligations where relevant.",
      ],
      high: [
        "Introduce consistent scoring and reporting.",
        "Check controls operate (not just exist).",
        "Use trends to drive investment.",
      ],
      very_high: [
        "Optimise decision-making using metrics.",
        "Embed risk into planning and change.",
        "Continuous assurance approach.",
      ],
    },
  },
  "Asset & Data Management": {
    why: "You can't protect what you don't know you have. Asset and data clarity reduces outages, leakage and incident confusion.",
    actions: {
      very_low: [
        "List critical systems and key data sets.",
        "Assign owners for each critical system.",
        "Label data: public / internal / confidential.",
      ],
      low: [
        "Define handling rules per label.",
        "Introduce retention periods for key data.",
        "Document where backups and records live.",
      ],
      mid: [
        "Review inventories quarterly.",
        "Standardise secure disposal.",
        "Reduce shadow/unknown systems.",
      ],
      high: [
        "Audit access to sensitive data.",
        "Improve monitoring for critical assets.",
        "Harden key systems and configurations.",
      ],
      very_high: [
        "Automate inventory where possible.",
        "Strengthen lifecycle governance and assurance.",
        "Maintain maturity through growth.",
      ],
    },
  },
  "Identity & Access Management": {
    why: "Access failures drive many incidents. Strong identity controls reduce account takeover and insider risk quickly.",
    actions: {
      very_low: [
        "Enable MFA for email/cloud/admin accounts.",
        "Create and enforce a leavers checklist.",
        "List admin accounts and remove unnecessary ones.",
      ],
      low: [
        "Review admin access quarterly.",
        "Control shared accounts and document ownership.",
        "Make role-based access the default.",
      ],
      mid: [
        "Run access reviews for sensitive systems.",
        "Separate admin vs daily accounts.",
        "Improve privileged oversight and logging.",
      ],
      high: [
        "Measure leaver removal time and improve it.",
        "Test access controls periodically.",
        "Strengthen joiners/movers/leavers workflow.",
      ],
      very_high: [
        "Optimise privileged access governance.",
        "Continuous monitoring and assurance.",
        "Maintain maturity at scale.",
      ],
    },
  },
  "Secure Operations": {
    why: "Day-to-day resilience: patching, backups, logging, configuration and change control.",
    actions: {
      very_low: [
        "Confirm backups run and alert on failures.",
        "Set a patch routine (critical fixes within X days).",
        "Introduce simple change approval for key systems.",
      ],
      low: [
        "Centralise key logs (or use an MSP).",
        "Define baseline configurations for key systems.",
        "Track patch compliance monthly.",
      ],
      mid: [
        "Restore test backups quarterly.",
        "Measure patch SLAs and exceptions.",
        "Harden systems against misconfiguration.",
      ],
      high: [
        "Improve monitoring coverage.",
        "Create runbooks for common failures.",
        "Add resilience checks into changes.",
      ],
      very_high: [
        "Automate checks and assurance.",
        "Use trend analysis to prevent drift.",
        "Maintain maturity through change.",
      ],
    },
  },
  "Threat & Vulnerability Management": {
    why: "Exposure management reduces preventable incidents by finding weaknesses early and fixing them on time.",
    actions: {
      very_low: [
        "Start monthly vulnerability scanning (or MSP).",
        "Agree critical fix timeline (e.g. 14 days).",
        "Risk-check changes before rollout.",
      ],
      low: [
        "Track vulnerabilities to closure.",
        "Prioritise internet-facing systems.",
        "Record exceptions with sign-off.",
      ],
      mid: [
        "Measure remediation performance.",
        "Coordinate patch and vulnerability management.",
        "Use asset criticality to prioritise fixes.",
      ],
      high: [
        "Increase coverage for key assets.",
        "Improve prioritisation using risk context.",
        "Test change process effectiveness.",
      ],
      very_high: [
        "Optimise with automation.",
        "Proactive testing and assurance.",
        "Maintain maturity at scale.",
      ],
    },
  },
  "Incident Detection & Response": {
    why: "Faster detection and clear response reduces downtime, cost and reputational damage.",
    actions: {
      very_low: [
        "Write a 1-page incident response plan.",
        "Define escalation and contacts.",
        "Create a simple incident log.",
      ],
      low: [
        "Run a tabletop exercise within 90 days.",
        "Add detection for key systems (email/cloud).",
        "Use a lessons-learned checklist.",
      ],
      mid: [
        "Refine runbooks for common incidents.",
        "Track improvements to closure.",
        "Improve reporting and escalation.",
      ],
      high: [
        "Measure response time and detection gaps.",
        "Increase monitoring coverage.",
        "Regular exercises and improvement cycles.",
      ],
      very_high: [
        "Optimise telemetry and response assurance.",
        "Continuous learning loop.",
        "Maintain maturity at scale.",
      ],
    },
  },
  "Resilience & Recovery": {
    why: "Recovery keeps you trading when something breaks. Backups without restore tests don't count.",
    actions: {
      very_low: [
        "List critical services.",
        "Set recovery targets (time-to-recover).",
        "Perform a restore test to prove recovery.",
      ],
      low: [
        "Document dependencies (systems, people, suppliers).",
        "Create a recovery runbook.",
        "Run a disruption tabletop.",
      ],
      mid: [
        "Test recovery quarterly.",
        "Improve backup coverage for critical systems.",
        "Measure restore success and time.",
      ],
      high: [
        "Add resilience checks into change.",
        "Improve communications plan.",
        "Improve evidence and reporting.",
      ],
      very_high: [
        "Optimise resilience engineering.",
        "Continuous validation of recovery.",
        "Maintain maturity through growth.",
      ],
    },
  },
  "Third-Party & Supply Chain": {
    why: "Suppliers can become single points of failure. Contract controls and assurance reduce risk quickly.",
    actions: {
      very_low: [
        "List critical suppliers and what they support.",
        "Add basic security clauses (incident notice, minimum controls).",
        "Control supplier access (least privilege).",
      ],
      low: [
        "Review critical suppliers annually.",
        "Record supplier risks and owners.",
        "Plan for supplier incidents/disruption.",
      ],
      mid: [
        "Assess suppliers on onboarding and periodically.",
        "Track remediation for gaps.",
        "Reduce dependency where possible.",
      ],
      high: [
        "Improve assurance for key suppliers.",
        "Test supplier incident paths.",
        "Improve reporting and governance.",
      ],
      very_high: [
        "Optimise supply chain resilience.",
        "Continuous monitoring and assurance.",
        "Maintain maturity at scale.",
      ],
    },
  },
};

function build306090Plan(ranked: { domain_name: string; domain_code: string; score: number }[]) {
  const weakest = ranked.slice(0, 3);

  const plan = {
    d30: [] as string[],
    d60: [] as string[],
    d90: [] as string[],
  };

  plan.d30.push(
    "Assign owners for each domain priority and agree a weekly check-in until Day 30.",
    "Enable MFA for email/cloud/admin accounts and enforce a leavers checklist.",
    "Confirm backups run and complete one restore test for a critical system."
  );

  plan.d60.push(
    "Introduce a patch/vulnerability routine with targets and exception sign-off.",
    "Run a tabletop exercise (incident + disruption) and capture actions to closure.",
    "Create a simple risk register and review it with leadership at least monthly."
  );

  plan.d90.push(
    "Strengthen evidence: keep logs/reports, test results, minutes, and approvals in one place.",
    "Extend controls to key suppliers: list critical suppliers, access paths, and review cadence.",
    "Add lightweight KPIs (restore success, patch timeliness, exercise cadence) and review trends."
  );

  for (const d of weakest) {
    const name = d.domain_name || d.domain_code || "Domain";
    const cfg = DOMAIN_ANALYSIS[name] || DOMAIN_ANALYSIS[d.domain_code];
    if (!cfg) continue;

    const band = scoreBand(d.score);
    const acts = (cfg.actions[band] ?? []).map(sanitizeText);

    if (acts[0]) plan.d30.push(`${name}: ${acts[0]}`);
    if (acts[1]) plan.d60.push(`${name}: ${acts[1]}`);
    if (acts[2]) plan.d90.push(`${name}: ${acts[2]}`);
  }

  const dedupe = (arr: string[]) => Array.from(new Set(arr.map(sanitizeText)));
  plan.d30 = dedupe(plan.d30);
  plan.d60 = dedupe(plan.d60);
  plan.d90 = dedupe(plan.d90);

  return plan;
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if ((assessment.reportTier ?? "free") !== "premium") {
      return NextResponse.json(
        {
          error: "premium_required",
          message: "Premium report is locked. Please upgrade to download the PDF.",
        },
        { status: 402 }
      );
    }

    const overall = Number(assessment.overallScore ?? 0);
    const grade = sanitizeText(String(assessment.grade ?? "-"));
    const companyName = sanitizeText(String(assessment.companyName ?? "")).trim();
    const domainScoresRaw = (assessment.domainScores ?? []) as any[];
    const assessmentDate = formatDate(assessment.completedAt ?? assessment.createdAt);

    const compact = sanitizeText(id.replace(/-/g, "").toUpperCase());
    const reportRef = `RS-${compact.slice(0, 8)}`;

    const domainScores = (Array.isArray(domainScoresRaw) ? domainScoresRaw : [])
      .map((d) => ({
        domain_code: sanitizeText(String(d.domain_code ?? d.domain ?? d.code ?? d.domain_name ?? "")).trim(),
        domain_name: sanitizeText(String(d.domain_name ?? d.domain ?? d.name ?? d.domain_code ?? "")).trim(),
        score: Number(d.score ?? 0),
      }))
      .filter((d) => d.domain_name || d.domain_code);

    const ranked = [...domainScores].sort((a, b) => a.score - b.score);
    const topRisks = ranked.slice(0, 3);
    const topStrengths = ranked.slice(-3).reverse();

    const domainCodes = domainScores.map((d) => d.domain_code).filter(Boolean);
    const actions90 = loadActionsForDomains(domainCodes).slice(0, 12);
    const plan306090 = build306090Plan(ranked);

    const keyFindingActions = topRisks
      .map((d) => {
        const name = d.domain_name || d.domain_code || "Domain";
        const cfg = DOMAIN_ANALYSIS[name] || DOMAIN_ANALYSIS[d.domain_code];
        if (!cfg) return null;
        const band = scoreBand(d.score);
        return sanitizeText(cfg.actions[band]?.[0] ?? "");
      })
      .filter(Boolean)
      .slice(0, 3) as string[];

    const shieldPath = path.join(process.cwd(), "public", "icon.png");
    const watermarkPath = path.join(process.cwd(), "public", "resiliscore_shield_watermark_transparent.png");

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const shieldImg = fs.existsSync(shieldPath)
      ? await pdfDoc.embedPng(fs.readFileSync(shieldPath))
      : undefined;

    const watermarkImg = fs.existsSync(watermarkPath)
      ? await pdfDoc.embedPng(fs.readFileSync(watermarkPath))
      : undefined;

    let pageNum = 1;

    /**
     * ------------------------------
     * Cover page (real cover)
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.08);

      const { height } = page.getSize();
      let y = height - 150;

      page.drawText("RESILISCORE", {
        x: 50,
        y,
        size: 32,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 38;

      page.drawText("Cyber Resilience Maturity Assessment Report", {
        x: 50,
        y,
        size: 18,
        font: fontBold,
        color: rgb(0.16, 0.16, 0.16),
      });

      y -= 20;
      page.drawRectangle({ x: 50, y, width: 190, height: 6, color: BRAND.accent });

      y -= 42;

      if (companyName) {
        page.drawText("Company", { x: 50, y, size: 10, font: fontBold, color: BRAND.muted });
        y -= 16;
        page.drawText(companyName, { x: 50, y, size: 13, font, color: BRAND.text });
        y -= 26;
      }

      page.drawText("Assessment date", { x: 50, y, size: 10, font: fontBold, color: BRAND.muted });
      y -= 16;
      page.drawText(assessmentDate, { x: 50, y, size: 13, font, color: BRAND.text });
      y -= 26;

      page.drawText("Report reference", { x: 50, y, size: 10, font: fontBold, color: BRAND.muted });
      y -= 16;
      page.drawText(reportRef, { x: 50, y, size: 13, font, color: BRAND.text });
      y -= 36;

      page.drawText("Overall score", { x: 50, y, size: 10, font: fontBold, color: BRAND.muted });
      y -= 24;
      page.drawText(`${overall.toFixed(2)} / 5`, {
        x: 50,
        y,
        size: 28,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 28;
      page.drawText(`${grade} - ${scoreLabel(overall)}`, {
        x: 50,
        y,
        size: 14,
        font: fontBold,
        color: BRAND.text,
      });

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Key findings
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Key Findings", 50, y, fontBold);
      y -= 30;

      const strongestNames = topStrengths.map((d) => shortDomainLabel(d.domain_name || d.domain_code || "Domain"));
      const weakestNames = topRisks.map((d) => shortDomainLabel(d.domain_name || d.domain_code || "Domain"));

      const posture =
        `Your organisation shows a ${scoreLabel(overall)} maturity level ` +
        `(${overall.toFixed(2)} / 5). ` +
        (strongestNames.length
          ? `Relative strengths are currently more visible in ${strongestNames.join(", ")}. `
          : "") +
        (weakestNames.length
          ? `Priority improvement areas are ${weakestNames.join(", ")}.`
          : "");

      page.drawText("Current resilience posture", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 16;

      for (const line of wrapText(posture, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      y -= 10;

      page.drawText("Highest priority improvements", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      for (const d of topRisks) {
        const name = d.domain_name || d.domain_code || "Domain";
        for (const line of wrapText(`• ${name} (${Number(d.score ?? 0).toFixed(2)} / 5)`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
      }

      y -= 10;

      page.drawText("Immediate actions", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const immediateActions = keyFindingActions.length
        ? keyFindingActions
        : [
            "Enforce MFA for privileged and cloud accounts.",
            "Track vulnerabilities to closure.",
            "Establish clear asset ownership.",
          ];

      for (const a of immediateActions) {
        for (const line of wrapText(`• ${a}`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
        y -= 2;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Executive summary
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Executive Summary", 50, y, fontBold);
      y -= 34;

      page.drawText("Overall result", { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
      y -= 18;

      page.drawText(sanitizeText(`Overall score: ${overall.toFixed(2)} / 5`), {
        x: 50,
        y,
        size: 10,
        font,
        color: BRAND.text,
      });
      page.drawText(sanitizeText(`Grade: ${grade}`), {
        x: 260,
        y,
        size: 11,
        font,
        color: BRAND.text,
      });
      page.drawText(sanitizeText(`Maturity: ${scoreLabel(overall)}`), {
        x: 360,
        y,
        size: 11,
        font,
        color: BRAND.text,
      });

      y -= 18;
      drawBar(page, 50, y, 280, 10, overall / 5);
      page.drawText("0", { x: 50, y: y - 12, size: 8, font, color: BRAND.muted });
      page.drawText("5", { x: 330, y: y - 12, size: 8, font, color: BRAND.muted });

      drawTrafficLight(page, 50, y - 36, scoreBand(overall), fontBold, font);

      y -= 64;

      const band = scoreBand(overall);
      const execCopy =
        band === "very_low"
          ? [
              "Controls are limited or not operating consistently day-to-day.",
              "Fast wins: ownership, MFA/leavers, backup restore testing, and a simple risk register.",
              "Reduce disruption risk first, then turn improvements into repeatable routines with owners and dates.",
            ]
          : band === "low"
          ? [
              "Some controls exist, but consistency and evidence may be patchy across domains.",
              "Prioritise the weakest 2-3 domains and convert them into routines (owner, cadence, evidence).",
              "Add basic measurement (restore success, patch timeliness, exercise cadence) to move maturity up quickly.",
            ]
          : band === "mid"
          ? [
              "Defined practices exist. Next step is consistency, measurement and proof they work under pressure.",
              "Lift the weakest domains to remove single points of failure.",
              "Introduce lightweight assurance: testing, evidence, and simple KPIs.",
            ]
          : band === "high"
          ? [
              "Good consistency across most domains with opportunities to strengthen assurance and measurement.",
              "Biggest gains now are proving effectiveness: testing, exercising, tightening exceptions.",
              "Maintain standards as the business changes (new suppliers, systems, growth).",
            ]
          : [
              "Strong foundations with disciplined operating practices and continuous improvement.",
              "Focus on optimising assurance and reducing hidden risk through measurement.",
              "Embed resilience into onboarding, procurement and system change to maintain maturity at scale.",
            ];

      page.drawText("Interpretation (consultant view)", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 16;

      for (const b of execCopy) {
        for (const line of wrapText(`• ${b}`, 98)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 14;
        }
        y -= 2;
      }

      y -= 10;
      page.drawText("Top priorities (weakest domains)", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      for (const d of topRisks) {
        const name = d.domain_name || d.domain_code || "Domain";
        const nameLines = wrapText(name, 40);

        page.drawText(nameLines[0] ?? "Domain", {
          x: 50,
          y,
          size: 10.5,
          font,
          color: BRAND.text,
        });
        page.drawText(sanitizeText(`${Number(d.score ?? 0).toFixed(2)}`), {
          x: 430,
          y,
          size: 10.5,
          font: fontBold,
          color: BRAND.text,
        });
        drawBar(page, 270, y - 2, 145, 8, Number(d.score ?? 0) / 5);
        y -= 16;

        if (nameLines.length > 1) {
          page.drawText(nameLines[1], { x: 50, y, size: 9.5, font, color: BRAND.muted });
          y -= 14;
        }
      }

      y -= 8;
      page.drawText("Key strengths (highest domains)", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      for (const d of topStrengths) {
        const name = d.domain_name || d.domain_code || "Domain";
        const nameLines = wrapText(name, 40);

        page.drawText(nameLines[0] ?? "Domain", {
          x: 50,
          y,
          size: 10.5,
          font,
          color: BRAND.text,
        });
        page.drawText(sanitizeText(`${Number(d.score ?? 0).toFixed(2)}`), {
          x: 430,
          y,
          size: 10.5,
          font: fontBold,
          color: BRAND.text,
        });
        drawBar(page, 270, y - 2, 145, 8, Number(d.score ?? 0) / 5);
        y -= 16;

        if (nameLines.length > 1) {
          page.drawText(nameLines[1], { x: 50, y, size: 9.5, font, color: BRAND.muted });
          y -= 14;
        }
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Maturity score + grade explained
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Maturity score and grade explained", 50, y, fontBold);
      y -= 30;

      const intro =
        "This page explains what your maturity score and grade mean in plain language. Resiliscore uses a 0-5 maturity scale to measure whether key resilience controls exist, operate consistently, and can be evidenced.";
      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }
      y -= 10;

      page.drawText("Your overall result", { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
      y -= 18;

      page.drawText(sanitizeText(`Overall score: ${overall.toFixed(2)} / 5`), {
        x: 50,
        y,
        size: 11,
        font,
        color: BRAND.text,
      });
      page.drawText(sanitizeText(`Grade: ${grade}`), {
        x: 260,
        y,
        size: 11,
        font,
        color: BRAND.text,
      });
      page.drawText(sanitizeText(`Maturity label: ${scoreLabel(overall)}`), {
        x: 360,
        y,
        size: 11,
        font,
        color: BRAND.text,
      });
      y -= 18;

      drawBar(page, 50, y, 280, 10, overall / 5);
      page.drawText("0", { x: 50, y: y - 12, size: 8, font, color: BRAND.muted });
      page.drawText("5", { x: 330, y: y - 12, size: 8, font, color: BRAND.muted });

      drawTrafficLight(page, 50, y - 36, scoreBand(overall), fontBold, font);

      y -= 68;

      page.drawText("Grade bands (A to E)", { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
      y -= 14;

      const gradeBands = [
        "A: 4.50 - 5.00  Optimised (measured, tested, improving)",
        "B: 3.50 - 4.49  Managed (consistent, owned, repeatable)",
        "C: 2.50 - 3.49  Defined (documented, uneven consistency)",
        "D: 1.50 - 2.49  Repeatable (some routine, notable gaps)",
        "E: 0.00 - 1.49  Not in place (informal, reactive)",
      ];

      for (const g of gradeBands) {
        page.drawText(sanitizeText(`- ${g}`), { x: 50, y, size: 10.2, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      y -= 8;

      page.drawText("How to interpret your score (SME guidance)", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const interp = [
        "Your score is a snapshot of maturity today, based on your responses. It is designed to help prioritise improvements that reduce disruption risk fastest.",
        "Moving up is usually less about buying tools and more about three things: ownership (someone is accountable), cadence (it happens regularly), and evidence (you can prove it quickly).",
        "Focus on lifting the lowest 2-3 domains first. That typically removes the biggest single points of failure and improves overall resilience fastest.",
      ];

      for (const b of interp) {
        for (const line of wrapText(`- ${b}`, 102)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 14;
        }
        y -= 2;
      }

      y -= 6;

      page.drawText("How the score is calculated (simple)", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const calc = [
        "Each question is scored from 0 to 5.",
        "Each domain score is the average of the questions in that domain.",
        "Overall score is the average of the domain scores.",
        "Grade is derived from the overall score using the bands above.",
      ];

      for (const c of calc) {
        page.drawText(sanitizeText(`- ${c}`), { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Framework mapping explained
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Framework mapping (plain English)", 50, y, fontBold);
      y -= 30;

      const intro =
        "Resiliscore includes framework mapping to help SMEs translate improvements into language that customers, auditors, insurers, and procurement teams recognise. This is not a certification. It is guidance to support alignment and reporting.";
      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }
      y -= 10;

      page.drawText("Why these frameworks were selected", { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
      y -= 14;

      const why = [
        "NIST CSF is widely understood as a practical structure for cyber outcomes (identify, protect, detect, respond, recover).",
        "ISO 27001 / 27002 themes are common reference points for policies and controls, especially for supplier assurance and audits.",
        "Using familiar language reduces the friction of questionnaires and improves the quality of due diligence conversations.",
      ];

      for (const b of why) {
        for (const line of wrapText(`- ${b}`, 102)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 14;
        }
        y -= 2;
      }

      y -= 8;

      page.drawText("How mapping is implemented in Resiliscore (in practice)", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const how = [
        "Each question is tagged to one or more framework themes (for example: access control, backups, incident response, supplier assurance).",
        "When you improve a control in the 30/60/90 plan, you are also improving the related framework themes that buyers and auditors ask about.",
        "Mapping is used to support reporting and evidence, not to replace formal compliance work or audits.",
      ];

      for (const b of how) {
        for (const line of wrapText(`- ${b}`, 102)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 14;
        }
        y -= 2;
      }

      y -= 8;

      page.drawText("How this affects SMEs (the benefit)", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const sme = [
        "Faster questionnaires: reuse a consistent evidence set instead of answering from scratch each time.",
        "Clearer priorities: improvements tie back to recognised themes, making investment easier to justify.",
        "Better credibility: you can explain controls in a way that procurement teams recognise without needing heavy compliance overhead.",
        "Reduced panic: evidence and ownership means you can respond quickly to customer security questions.",
      ];

      for (const b of sme) {
        for (const line of wrapText(`- ${b}`, 102)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 14;
        }
        y -= 2;
      }

      y -= 8;

      page.drawText("Important note", { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
      y -= 14;

      const note =
        "Framework mapping is guidance. Resiliscore is designed as an SME resilience tool and does not provide certification. If you need formal compliance or audit outputs, use these mappings as a starting point for structured work with an expert.";
      for (const line of wrapText(note, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Visuals page (Radar + ranked bars)
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Results Visuals", 50, y, fontBold);
      y -= 28;

      const radarCx = 190;
      const radarCy = 520;
      const radarR = 112;

      const RADAR_ORDER = ["Response", "Recovery", "Operations", "Identity", "Governance", "Asset", "Threat", "Suppliers", "Risk"];

      const radarDomains = [...domainScores]
        .map((d) => ({
          ...d,
          short: shortDomainLabel(d.domain_name || d.domain_code || ""),
        }))
        .sort((a, b) => RADAR_ORDER.indexOf(a.short) - RADAR_ORDER.indexOf(b.short))
        .slice(0, 9);

      const labels = radarDomains.map((d) => d.short);
      const values01 = radarDomains.map((d) => Number(d.score ?? 0) / 5);

      {
        const n = Math.max(3, Math.min(values01.length, 12));
        const vals = values01.slice(0, n).map((v) => clamp(v, 0, 1));
        const ang0 = -Math.PI / 2;

        for (const t of [0.25, 0.5, 0.75, 1]) {
          const rr = radarR * t;
          page.drawCircle({ x: radarCx, y: radarCy, size: rr, borderWidth: 1, borderColor: rgb(0.90, 0.90, 0.90) });
        }

        for (let i = 0; i < n; i++) {
          const a = ang0 + (i * 2 * Math.PI) / n;
          const x = radarCx + Math.cos(a) * radarR;
          const yy = radarCy + Math.sin(a) * radarR;
          page.drawLine({ start: { x: radarCx, y: radarCy }, end: { x, y: yy }, thickness: 1, color: rgb(0.92, 0.92, 0.92) });
        }

        const pts = vals.map((v, i) => {
          const a = ang0 + (i * 2 * Math.PI) / n;
          return {
            x: radarCx + Math.cos(a) * radarR * v,
            y: radarCy + Math.sin(a) * radarR * v,
          };
        });

        const pathD = "M " + pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" L ") + " Z";

        page.drawSvgPath(pathD, {
          color: rgb(0.36, 0.84, 0.46),
          opacity: 0.16,
          borderColor: rgb(0.36, 0.84, 0.46),
          borderWidth: 2,
        });

        for (let i = 0; i < pts.length; i++) {
          const p1 = pts[i];
          const p2 = pts[(i + 1) % pts.length];
          page.drawLine({
            start: { x: p1.x, y: p1.y },
            end: { x: p2.x, y: p2.y },
            thickness: 1,
            color: rgb(0.36, 0.84, 0.46),
            opacity: 0.35 as any,
          });
        }

        for (const p of pts) {
          page.drawCircle({
            x: p.x,
            y: p.y,
            size: 3.2,
            color: rgb(0.36, 0.84, 0.46),
            opacity: 0.95,
          });
          page.drawCircle({
            x: p.x,
            y: p.y,
            size: 4.8,
            borderWidth: 1,
            borderColor: rgb(0.36, 0.84, 0.46),
            opacity: 0.35,
          });
        }

        for (let i = 0; i < n; i++) {
          const a = ang0 + (i * 2 * Math.PI) / n;
          const lab = sanitizeText(labels[i] ?? "");
          if (!lab) continue;

          const lx = radarCx + Math.cos(a) * (radarR + 16);
          const ly = radarCy + Math.sin(a) * (radarR + 16);

          const leftSide = Math.cos(a) < -0.2;
          const rightSide = Math.cos(a) > 0.2;

          const size = 7.0;
          const x = rightSide ? lx - 8 : leftSide ? lx - 28 : lx - 18;

          page.drawText(lab, {
            x,
            y: ly - 4,
            size,
            font,
            color: BRAND.muted,
          });
        }

        page.drawText("Scale: 0-5", { x: 85, y: 380, size: 9, font, color: BRAND.muted });
      }

      const rightX = 352;
      page.drawText("Ranked domains (weakest first)", {
        x: rightX,
        y: 660,
        size: 10.5,
        font: fontBold,
        color: BRAND.text,
      });

      let by = 640;
      const rankedForBars = [...ranked]
        .map((d) => ({
          ...d,
          short: shortDomainLabel(d.domain_name || d.domain_code || ""),
        }))
        .slice(0, 9);

      for (const d of rankedForBars) {
        const label = d.short || "Domain";
        const score = Number(d.score ?? 0);

        page.drawText(label, { x: rightX, y: by, size: 9.5, font, color: BRAND.text });
        drawBar(page, rightX + 82, by - 2, 130, 8, score / 5);

        page.drawText(sanitizeText(score.toFixed(2)), {
          x: 545 - 28,
          y: by,
          size: 9.5,
          font: fontBold,
          color: BRAND.text,
        });

        by -= 22;
        if (by < 380) break;
      }

      let ey = 340;
      page.drawText("How to read this", { x: 50, y: ey, size: 11, font: fontBold, color: BRAND.text });
      ey -= 14;

      const expl = [
        "The radar shows relative maturity by domain (0-5 scaled). Bigger shape = more consistent controls.",
        "The ranked list highlights where disruption risk is most likely to come from first.",
        "Focus on lifting the lowest 2-3 domains - that usually produces the fastest overall improvement.",
      ];

      for (const b of expl) {
        for (const line of wrapText(`• ${b}`, 98)) {
          page.drawText(line, { x: 50, y: ey, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          ey -= 14;
        }
        ey -= 2;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Domain risk priority (RAG view)
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Domain Risk Priority (RAG View)", 50, y, fontBold);
      y -= 28;

      const intro =
        "This view highlights which resilience domains require the most immediate attention. Domains are grouped using a Red-Amber-Green (RAG) model based on maturity scores.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, {
          x: 50,
          y,
          size: 10.5,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= 14;
      }

      y -= 10;

      const redDomains = ranked.filter((d) => Number(d.score ?? 0) < 2.0);
      const amberDomains = ranked.filter((d) => Number(d.score ?? 0) >= 2.0 && Number(d.score ?? 0) < 3.5);
      const greenDomains = ranked.filter((d) => Number(d.score ?? 0) >= 3.5);

      const drawRagGroup = (
        title: string,
        subtitle: string,
        color: ReturnType<typeof rgb>,
        domains: { domain_name: string; domain_code: string; score: number }[]
      ) => {
        page.drawText(sanitizeText(title), {
          x: 50,
          y,
          size: 11,
          font: fontBold,
          color,
        });
        y -= 14;

        for (const line of wrapText(subtitle, 100)) {
          page.drawText(line, { x: 50, y, size: 10, font, color: BRAND.muted });
          y -= 13;
        }

        y -= 4;

        if (!domains.length) {
          page.drawText("None at present.", {
            x: 50,
            y,
            size: 10.5,
            font,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= 18;
        } else {
          for (const d of domains) {
            const name = d.domain_name || d.domain_code || "Domain";

            page.drawText(sanitizeText(name), {
              x: 50,
              y,
              size: 10.5,
              font,
              color: BRAND.text,
            });

            page.drawText(sanitizeText(Number(d.score ?? 0).toFixed(2)), {
              x: 430,
              y,
              size: 10.5,
              font: fontBold,
              color: BRAND.text,
            });

            drawBar(page, 270, y - 2, 145, 8, Number(d.score ?? 0) / 5);
            y -= 18;
          }
        }

        y -= 8;
        page.drawLine({
          start: { x: 50, y },
          end: { x: 545, y },
          thickness: 1,
          color: rgb(0.92, 0.92, 0.92),
        });
        y -= 14;
      };

      drawRagGroup(
        "Red - Priority attention",
        "These domains represent the greatest resilience exposure and should typically be prioritised for improvement.",
        rgb(0.88, 0.30, 0.30),
        redDomains
      );

      drawRagGroup(
        "Amber - Improvement needed",
        "Controls exist but may lack consistency, ownership, or supporting evidence.",
        rgb(0.90, 0.62, 0.18),
        amberDomains
      );

      drawRagGroup(
        "Green - Relative strength",
        "These domains demonstrate stronger operating practices relative to the rest of the organisation.",
        rgb(0.24, 0.68, 0.34),
        greenDomains
      );

      if (y > 110) {
        const guidance =
          "Priority guidance: focus improvement efforts first on Red domains, then stabilise Amber domains, while maintaining Green domains through routine monitoring.";

        for (const line of wrapText(guidance, 102)) {
          page.drawText(line, {
            x: 50,
            y,
            size: 10.5,
            font,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= 14;
        }
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Deep-dive narrative
     * ------------------------------
     */
    {
      let page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Deep Dive (Consultant Narrative)", 50, y, fontBold);
      y -= 26;

      const intro =
        "This section explains what your results mean in practical terms. It is not question-by-question; it focuses on outcomes, consistency, evidence, and what typically reduces disruption risk fastest for SMEs.";
      for (const line of wrapText(intro, 100)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }
      y -= 10;

      for (const d of ranked) {
        const name = d.domain_name || d.domain_code || "Domain";
        const score = Number(d.score ?? 0);
        const band = scoreBand(score);

        const cfg =
          DOMAIN_ANALYSIS[name] ||
          DOMAIN_ANALYSIS[d.domain_code] || {
            why: "This domain affects resilience outcomes. Improving consistency and evidence reduces disruption risk.",
            actions: {
              very_low: [
                "Assign an owner and define the basics.",
                "Create a simple routine/checklist.",
                "Start collecting evidence.",
              ],
              low: [
                "Make it repeatable with owners and dates.",
                "Track actions to closure.",
                "Reduce reliance on memory.",
              ],
              mid: [
                "Add measurement and regular review.",
                "Strengthen evidence quality.",
                "Test that controls work.",
              ],
              high: [
                "Improve assurance and trend reporting.",
                "Reduce exceptions.",
                "Embed into change.",
              ],
              very_high: ["Optimise and automate.", "Continuous improvement.", "Maintain at scale."],
            },
          };

        if (y < 170) {
          drawFooter(page, pageNum++, font, reportRef);
          page = addPage(pdfDoc);
          drawBrandHeader(page, shieldImg);
          drawWatermark(page, watermarkImg, 0.12);
          y = height - 96;
        }

        page.drawText(sanitizeText(name), { x: 50, y, size: 12, font: fontBold, color: BRAND.text });
        page.drawText(sanitizeText(`${score.toFixed(2)} / 5`), {
          x: 470,
          y,
          size: 12,
          font: fontBold,
          color: BRAND.text,
        });
        y -= 14;

        drawBar(page, 50, y, 495, 8, score / 5);
        y -= 18;

        page.drawText("Why it matters", { x: 50, y, size: 10, font: fontBold, color: BRAND.muted });
        y -= 12;
        for (const line of wrapText(cfg.why, 105)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 14;
        }

        y -= 4;

        page.drawText("Recommended focus", { x: 50, y, size: 10, font: fontBold, color: BRAND.muted });
        y -= 12;

        const acts = (cfg.actions[band] ?? []).slice(0, 3).map(sanitizeText);
        for (const a of acts) {
          for (const line of wrapText(`• ${a}`, 105)) {
            page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
            y -= 14;
          }
          y -= 1;
        }

        y -= 10;
        page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.92, 0.92, 0.92) });
        y -= 14;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * 30/60/90 day plan
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "30 / 60 / 90 Day Improvement Plan", 50, y, fontBold);
      y -= 30;

      const intro =
        "This plan is designed to reduce disruption risk quickly. Day 30 focuses on quick wins and control basics, Day 60 adds testing and routine, and Day 90 strengthens evidence, suppliers, and measurement.";
      for (const line of wrapText(intro, 100)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }
      y -= 10;

      const blocks = [
        { title: "Days 0-30 (stabilise)", items: plan306090.d30 },
        { title: "Days 31-60 (prove + test)", items: plan306090.d60 },
        { title: "Days 61-90 (embed + measure)", items: plan306090.d90 },
      ];

      for (const b of blocks) {
        page.drawText(sanitizeText(b.title), { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
        y -= 16;

        for (const item of b.items) {
          for (const line of wrapText(`• ${item}`, 104)) {
            page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
            y -= 14;
          }
          y -= 2;
          if (y < 110) break;
        }

        y -= 10;
        page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0.92, 0.92, 0.92) });
        y -= 14;
        if (y < 110) break;
      }

      if (y > 150 && actions90.length) {
        page.drawText("Recommended actions (from your domain profile)", {
          x: 50,
          y,
          size: 11,
          font: fontBold,
          color: BRAND.text,
        });
        y -= 14;

        let i = 1;
        for (const a of actions90) {
          for (const line of wrapText(`${i}. ${a}`, 102)) {
            page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
            y -= 14;
            if (y < 90) break;
          }
          if (y < 90) break;
          y -= 2;
          i += 1;
        }
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Premium page 1: What this means for your business
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "What this means for your business", 50, y, fontBold);
      y -= 28;

      const overallBand = scoreBand(overall);
      const weakestNames = topRisks.map((d) => d.domain_name || d.domain_code || "Domain");

      const intro =
        overallBand === "very_low"
          ? "Your assessment suggests resilience is currently dependent on individuals, informal workarounds, or assumptions rather than consistent operating practice. In this state, issues may remain hidden until they become disruptive."
          : overallBand === "low"
          ? "Your assessment suggests some controls exist, but resilience may still depend too heavily on whether the right people remember to do the right things at the right time. This creates avoidable fragility."
          : overallBand === "mid"
          ? "Your assessment suggests there is a meaningful baseline in place, but some domains may still be too inconsistent to give leadership full confidence during a real incident or disruption."
          : overallBand === "high"
          ? "Your assessment suggests the business has a solid resilience foundation. The main challenge now is proving consistency, reducing exceptions, and making sure growth or change does not weaken control maturity."
          : "Your assessment suggests strong resilience foundations. The opportunity now is to preserve that maturity through business growth, supplier change, and continuous assurance.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      y -= 10;

      page.drawText("What stands out from your profile", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const profilePoints = [
        weakestNames.length
          ? `Your current profile suggests the greatest pressure is likely to come from these weaker areas: ${weakestNames.join(", ")}.`
          : "Your current profile suggests there are weaker domains that should be treated as priority areas.",
        "This usually means the business may believe some controls exist, but they may not yet be routine, owned, evidenced, or tested strongly enough.",
        "In practice, the commercial risk is not only a cyber incident itself, but delay, confusion, rework, weak evidence, and slower recovery when something goes wrong.",
        "The fastest improvement usually comes from lifting the weakest domains first rather than trying to improve everything at once.",
      ];

      for (const p of profilePoints) {
        for (const line of wrapText(`• ${p}`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
        y -= 2;
      }

      y -= 8;

      page.drawText("Consultant view", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const consultantView = [
        "At this stage, the business does not need complexity. It needs clarity on ownership, operating rhythm, and evidence.",
        "If the weakest areas are stabilised and made repeatable, overall resilience maturity usually improves faster than expected.",
        `Your current overall score of ${overall.toFixed(2)} / 5 indicates a maturity level of ${scoreLabel(overall)}. The next step is not more theory - it is more consistency.`,
      ];

      for (const p of consultantView) {
        for (const line of wrapText(`• ${p}`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
        y -= 2;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Premium page 2: Likely failure scenarios and exposure
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Likely failure scenarios and exposure", 50, y, fontBold);
      y -= 28;

      const scenarioForDomain = (name: string) => {
        const n = name.toLowerCase();

        if (n.includes("identity") || n.includes("access")) {
          return [
            "Access is removed late, MFA coverage is inconsistent, or admin privileges remain wider than they should be.",
            "This can lead to account misuse, avoidable exposure, or dependency on manual memory rather than process.",
          ];
        }

        if (n.includes("recovery") || n.includes("resilience")) {
          return [
            "Backups may exist, but recovery confidence is lower than assumed because restore testing or dependency planning is limited.",
            "This can lead to longer downtime, uncertainty during disruption, or delayed restoration of critical services.",
          ];
        }

        if (n.includes("incident") || n.includes("response")) {
          return [
            "An incident occurs, but roles, escalation or contacts are not clear enough at the moment they are needed.",
            "This can lead to slower containment, delayed decisions, and unnecessary operational confusion.",
          ];
        }

        if (n.includes("supplier") || n.includes("third-party")) {
          return [
            "A supplier issue creates disruption because critical dependencies, access paths, or security expectations are not well enough controlled.",
            "This can lead to service interruption, weak assurance, or slower recovery when a supplier problem occurs.",
          ];
        }

        if (n.includes("operations")) {
          return [
            "Routine controls such as patching, backup monitoring, logging, or change discipline are not operating as consistently as the business assumes.",
            "This can create hidden weakness that only becomes visible during failure, outage, or incident investigation.",
          ];
        }

        if (n.includes("risk")) {
          return [
            "Key issues may be known informally but not tracked, owned, or reviewed consistently enough to drive action.",
            "This can lead to recurring issues, delayed remediation, and weak visibility for leadership.",
          ];
        }

        if (n.includes("governance")) {
          return [
            "Leadership may support resilience in principle, but accountability, cadence, or decision structure may not be formal enough.",
            "This can lead to drift, unclear priorities, and controls that weaken over time.",
          ];
        }

        if (n.includes("asset") || n.includes("data")) {
          return [
            "Critical systems, data sets, or ownership may not be defined clearly enough for rapid protection or recovery decisions.",
            "This can lead to confusion during incidents, inconsistent protection, or gaps in evidence.",
          ];
        }

        if (n.includes("threat") || n.includes("vulnerability")) {
          return [
            "Exposure may remain open longer than intended because vulnerability identification, prioritisation, or closure is not yet disciplined enough.",
            "This can increase preventable attack surface and create avoidable operational risk.",
          ];
        }

        return [
          "This domain may be operating more informally than expected, increasing the chance of inconsistency under pressure.",
          "This can lead to avoidable disruption, weak evidence, or slower response when something goes wrong.",
        ];
      };

      const intro =
        "Lower-scoring domains do not guarantee failure, but they do indicate where real-world disruption is more likely to originate. The scenarios below translate weaker domains into practical business exposure.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
        y -= 14;
      }

      y -= 10;

      const focusDomains = ranked.slice(0, 3);

      for (const d of focusDomains) {
        const name = d.domain_name || d.domain_code || "Domain";
        const score = Number(d.score ?? 0);
        const scenarios = scenarioForDomain(name);

        if (y < 180) break;

        page.drawText(sanitizeText(name), { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
        page.drawText(sanitizeText(`${score.toFixed(2)} / 5`), {
          x: 470,
          y,
          size: 11,
          font: fontBold,
          color: BRAND.text,
        });
        y -= 14;

        drawBar(page, 50, y, 495, 8, score / 5);
        y -= 18;

        for (const s of scenarios) {
          for (const line of wrapText(`• ${s}`, 100)) {
            page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
            y -= 14;
          }
          y -= 2;
        }

        const exposureLine =
          "What would reduce this risk fastest: named ownership, a repeatable routine, and evidence that the control has actually operated.";

        for (const line of wrapText(exposureLine, 100)) {
          page.drawText(line, { x: 50, y, size: 10.2, font: fontBold, color: BRAND.muted });
          y -= 14;
        }

        y -= 10;
        page.drawLine({
          start: { x: 50, y },
          end: { x: 545, y },
          thickness: 1,
          color: rgb(0.92, 0.92, 0.92),
        });
        y -= 14;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Premium page 3: Next-level target state and evidence to prioritise
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Next-level target state and evidence to prioritise", 50, y, fontBold);
      y -= 28;

      const intro =
        "The aim is not perfection. The aim is to move the weakest domains to the next credible level of maturity. This page explains what better would look like next, and what evidence would give confidence that progress is real.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
        y -= 14;
      }

      y -= 10;

      const nextStateForDomain = (name: string) => {
        const n = name.toLowerCase();

        if (n.includes("identity") || n.includes("access")) {
          return {
            state: "MFA is consistently applied, admin access is reviewed, and joiners/movers/leavers are no longer dependent on memory.",
            evidence: [
              "MFA evidence for key accounts",
              "Leavers checklist with completed examples",
              "List of admin accounts with review date",
            ],
          };
        }

        if (n.includes("recovery") || n.includes("resilience")) {
          return {
            state: "Critical services are defined, restore confidence is proven, and recovery is no longer assumed.",
            evidence: [
              "Restore test result",
              "Critical services list",
              "Recovery runbook or simple recovery steps",
            ],
          };
        }

        if (n.includes("incident") || n.includes("response")) {
          return {
            state: "Escalation is clearer, contacts are available, and the business has practiced at least one realistic scenario.",
            evidence: [
              "1-page response plan",
              "Exercise notes or tabletop output",
              "Incident log or lessons learned tracker",
            ],
          };
        }

        if (n.includes("supplier") || n.includes("third-party")) {
          return {
            state: "Critical suppliers are known, access is controlled, and expectations are documented well enough for due diligence.",
            evidence: [
              "Critical supplier list",
              "Supplier security clauses or expectations",
              "Supplier access review or owner list",
            ],
          };
        }

        if (n.includes("operations")) {
          return {
            state: "Operational routines are regular, measurable, and no longer informal.",
            evidence: [
              "Patch or maintenance routine evidence",
              "Backup success reports",
              "Logging or monitoring confirmation for key systems",
            ],
          };
        }

        if (n.includes("risk")) {
          return {
            state: "Top risks are visible, owned, and reviewed in a way that drives action rather than discussion alone.",
            evidence: [
              "Risk register",
              "Action tracker with owners and dates",
              "Leadership review notes",
            ],
          };
        }

        if (n.includes("governance")) {
          return {
            state: "Leadership ownership is explicit, review cadence exists, and resilience decisions are easier to evidence.",
            evidence: ["Named owner", "Review meeting notes", "Core policy set"],
          };
        }

        if (n.includes("asset") || n.includes("data")) {
          return {
            state: "Critical assets and data are identifiable quickly enough to support protection, response and recovery decisions.",
            evidence: [
              "Critical asset register",
              "Data classification labels or guidance",
              "Owner list for key systems/data",
            ],
          };
        }

        if (n.includes("threat") || n.includes("vulnerability")) {
          return {
            state: "Vulnerabilities are found, prioritised and closed more predictably, with fewer silent exceptions.",
            evidence: [
              "Recent scan output",
              "Closure tracking for higher-risk items",
              "Exception or sign-off record",
            ],
          };
        }

        return {
          state: "The domain operates more consistently, with clearer ownership and stronger proof of operation.",
          evidence: ["Named owner", "Routine/checklist", "Evidence the routine has actually happened"],
        };
      };

      const focusDomains = ranked.slice(0, 3);

      for (const d of focusDomains) {
        const name = d.domain_name || d.domain_code || "Domain";
        const score = Number(d.score ?? 0);
        const next = nextStateForDomain(name);

        if (y < 190) break;

        page.drawText(sanitizeText(name), { x: 50, y, size: 11, font: fontBold, color: BRAND.text });
        page.drawText(sanitizeText(`${score.toFixed(2)} / 5`), {
          x: 470,
          y,
          size: 11,
          font: fontBold,
          color: BRAND.text,
        });
        y -= 14;

        drawBar(page, 50, y, 495, 8, score / 5);
        y -= 18;

        page.drawText("What better looks like next", {
          x: 50,
          y,
          size: 10,
          font: fontBold,
          color: BRAND.muted,
        });
        y -= 12;

        for (const line of wrapText(next.state, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
          y -= 14;
        }

        y -= 4;
        page.drawText("Evidence we would want to see next", {
          x: 50,
          y,
          size: 10,
          font: fontBold,
          color: BRAND.muted,
        });
        y -= 12;

        for (const e of next.evidence) {
          for (const line of wrapText(`• ${e}`, 100)) {
            page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
            y -= 14;
          }
        }

        y -= 8;
        page.drawLine({
          start: { x: 50, y },
          end: { x: 545, y },
          thickness: 1,
          color: rgb(0.92, 0.92, 0.92),
        });
        y -= 14;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Premium page: Management actions and ownership
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Management actions and ownership", 50, y, fontBold);
      y -= 28;

      const intro =
        "This page translates the assessment into management actions. The aim is to make ownership clearer, reduce ambiguity, and help leadership turn the report into action rather than discussion alone.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, {
          x: 50,
          y,
          size: 10.5,
          font,
          color: BRAND.text,
        });
        y -= 14;
      }

      y -= 10;

      page.drawText("Immediate management actions", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const immediate = [
        "Assign a named owner for each of the weakest priority domains.",
        "Set a review point within 30 days to check progress against the plan.",
        "Require evidence for the most important basic controls: access, backups, incident response, and supplier visibility.",
        "Agree which issues need leadership support versus operational follow-through.",
      ];

      for (const item of immediate) {
        for (const line of wrapText(`• ${item}`, 100)) {
          page.drawText(line, {
            x: 50,
            y,
            size: 10.5,
            font,
            color: BRAND.text,
          });
          y -= 14;
        }
        y -= 2;
      }

      y -= 8;

      page.drawText("Operational owner actions", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const operational = [
        "Complete the highest-priority remediation tasks in the lowest-scoring domains.",
        "Create or update the evidence pack so actions can be demonstrated quickly.",
        "Confirm which routines are recurring and who is responsible for maintaining them.",
        "Escalate dependencies, blockers, or weak supplier controls early rather than late.",
      ];

      for (const item of operational) {
        for (const line of wrapText(`• ${item}`, 100)) {
          page.drawText(line, {
            x: 50,
            y,
            size: 10.5,
            font,
            color: BRAND.text,
          });
          y -= 14;
        }
        y -= 2;
      }

      y -= 8;

      page.drawText("Questions leadership should ask now", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const questions = [
        "Which of our weakest domains creates the greatest disruption risk if nothing changes?",
        "What evidence do we have that critical controls are operating consistently today?",
        "Where are we relying on memory, good intent, or key individuals instead of repeatable process?",
        "Which supplier, system, or access weakness would hurt us most if it failed tomorrow?",
      ];

      for (const item of questions) {
        for (const line of wrapText(`• ${item}`, 100)) {
          page.drawText(line, {
            x: 50,
            y,
            size: 10.5,
            font,
            color: BRAND.text,
          });
          y -= 14;
        }
        y -= 2;
      }

      y -= 8;

      page.drawText("Suggested ownership model", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const ownership = [
        "Leadership: sponsor priorities, review progress, approve risk decisions, and challenge delays.",
        "Operational owner: implement actions, maintain evidence, and report progress.",
        "MSP or external support: provide technical execution, monitoring, remediation support, or specialist input where needed.",
      ];

      for (const item of ownership) {
        for (const line of wrapText(`• ${item}`, 100)) {
          page.drawText(line, {
            x: 50,
            y,
            size: 10.5,
            font,
            color: BRAND.text,
          });
          y -= 14;
        }
        y -= 2;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * MSP / IT Partner Support
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "MSP / IT Partner Support", 50, y, fontBold);
      y -= 28;

      const intro =
        "Many organisations implement resilience improvements with the support of their internal IT team or external IT provider. This report can be used as a practical roadmap for remediation and operational follow-through.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      y -= 10;

      page.drawText("Typical implementation areas", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const supportItems = [
        "Identity and access management improvements",
        "Backup testing and recovery validation",
        "Vulnerability remediation",
        "System hardening and patch routines",
        "Supplier access review",
      ];

      for (const item of supportItems) {
        for (const line of wrapText(`• ${item}`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
        y -= 2;
      }

      y -= 10;

      const closing =
        "If you work with an IT provider or MSP, this report can be used to structure improvements, agree ownership, and track delivery against the priority actions identified in the assessment.";

      for (const line of wrapText(closing, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Reassessment Recommendation
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Reassessment Recommendation", 50, y, fontBold);
      y -= 28;

      const intro =
        "Cyber resilience improves over time when controls become routine, measured, and evidence-based. Repeating the assessment helps leadership confirm that maturity is improving rather than drifting.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      y -= 10;

      page.drawText("Resiliscore recommends reassessment every 6-12 months, or after:", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 16;

      const triggers = [
        "New systems or cloud migrations",
        "Significant supplier changes",
        "Security incidents",
        "Rapid business growth",
      ];

      for (const t of triggers) {
        for (const line of wrapText(`• ${t}`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
      }

      y -= 10;

      const close =
        "Tracking progress over time helps leadership, auditors, insurers, customers, and delivery teams understand whether resilience maturity is strengthening in the areas that matter most.";

      for (const line of wrapText(close, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * Checklist page
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.14);

      const { height, width } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "Implementation Checklist", 50, y, fontBold);
      y -= 28;

      const field = (label: string, x: number, yTop: number, w: number) => {
        page.drawText(sanitizeText(label), { x, y: yTop, size: 9, font: fontBold, color: BRAND.muted });
        const boxY = yTop - 18;
        page.drawRectangle({
          x,
          y: boxY,
          width: w,
          height: 18,
          borderWidth: 1,
          borderColor: rgb(0.82, 0.82, 0.82),
          color: rgb(1, 1, 1),
        });
        return boxY - 10;
      };

      const col1X = 50;
      const col2X = 310;

      const fieldTop = y + 8;
      const afterRow1Y = field("Company / Organisation", col1X, fieldTop, 240);

      if (companyName) {
        page.drawText(sanitizeText(companyName), {
          x: col1X + 8,
          y: fieldTop - 14,
          size: 9.5,
          font,
          color: BRAND.text,
        });
      }

      field("Assessor name", col2X, fieldTop, 235);

      const row2Top = afterRow1Y - 6;
      const afterRow2Y = field("Date", col1X, row2Top, 240);
      field("Next review date", col2X, row2Top, 235);

      y = afterRow2Y - 6;

      const note =
        "Use this as a working sheet. Tick items as you implement them and keep the evidence in one place (folder, SharePoint, or policy pack).";
      for (const line of wrapText(note, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }
      y -= 10;

      page.drawText("Done", { x: 50, y, size: 9, font: fontBold, color: BRAND.muted });
      page.drawText("Checklist item", { x: 90, y, size: 9, font: fontBold, color: BRAND.muted });
      page.drawText("Evidence / Notes", { x: 400, y, size: 9, font: fontBold, color: BRAND.muted });
      y -= 10;
      page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 1,
        color: rgb(0.90, 0.90, 0.90),
      });
      y -= 16;

      const CHECKLIST_BY_DOMAIN: { domain: string; items: string[] }[] = [
        {
          domain: "Governance & Leadership",
          items: [
            "Named senior owner for cyber resilience (accountability defined)",
            "Monthly/quarterly leadership review cadence with tracked actions",
            "Basic policy set exists (access, backups, incident response)",
          ],
        },
        {
          domain: "Risk & Compliance",
          items: [
            "Risk register created (top risks, owners, impact in business terms)",
            "Accepted risks/exceptions recorded with sign-off and review date",
            "Actions tracked to closure (owners and deadlines)",
          ],
        },
        {
          domain: "Asset & Data Management",
          items: [
            "Critical systems and key data sets identified with owners",
            "Data labelled (public/internal/confidential) with handling rules",
            "Retention and secure disposal approach defined for key data",
          ],
        },
        {
          domain: "Identity & Access Management",
          items: [
            "MFA enabled for email/cloud/admin accounts",
            "Joiners / Movers / Leavers process in place (with evidence)",
            "Admin access reviewed regularly (unneeded privileges removed)",
          ],
        },
        {
          domain: "Secure Operations",
          items: [
            "Backups monitored (failures alert) + restore test completed (results recorded)",
            "Patch routine in place with targets + exception sign-off",
            "Logging/monitoring agreed for key systems (internal or MSP)",
          ],
        },
        {
          domain: "Threat & Vulnerability Management",
          items: [
            "Vulnerability scanning scheduled + remediation tracked",
            "Critical fixes prioritised for internet-facing systems",
            "Exceptions documented and reviewed (not forgotten)",
          ],
        },
        {
          domain: "Incident Detection & Response",
          items: [
            "Incident response plan (1-page) + contacts + escalation defined",
            "Tabletop exercise completed + actions tracked to closure",
            "Incident log maintained + lessons learned captured",
          ],
        },
        {
          domain: "Resilience & Recovery",
          items: [
            "Critical services identified + basic recovery targets set (time to recover)",
            "Recovery runbook exists for a key system/service",
            "Recovery testing cadence defined (restore/disruption exercises)",
          ],
        },
        {
          domain: "Third-Party & Supply Chain",
          items: [
            "Supplier list created + critical suppliers identified",
            "Supplier security clauses/expectations documented (minimum controls, incident notice)",
            "Supplier access controlled (least privilege) + review cadence defined",
          ],
        },
      ];

      const drawChecklistRow = (text: string) => {
        if (y < 80) return false;

        page.drawRectangle({
          x: 52,
          y: y - 2,
          width: 12,
          height: 12,
          borderWidth: 1,
          borderColor: rgb(0.70, 0.70, 0.70),
        });

        const lines = wrapText(text, 52);
        page.drawText(lines[0] ?? "", { x: 90, y, size: 10, font, color: BRAND.text });
        if (lines[1]) page.drawText(lines[1], { x: 90, y: y - 12, size: 9.5, font, color: BRAND.muted });

        page.drawLine({
          start: { x: 400, y: y - 2 },
          end: { x: width - 50, y: y - 2 },
          thickness: 1,
          color: rgb(0.88, 0.88, 0.88),
        });

        y -= lines[1] ? 28 : 18;
        return true;
      };

      for (const group of CHECKLIST_BY_DOMAIN) {
        if (y < 110) break;

        page.drawText(sanitizeText(group.domain), {
          x: 50,
          y,
          size: 10.5,
          font: fontBold,
          color: BRAND.text,
        });
        y -= 10;
        page.drawLine({
          start: { x: 50, y },
          end: { x: width - 50, y },
          thickness: 1,
          color: rgb(0.93, 0.93, 0.93),
        });
        y -= 14;

        for (const item of group.items.map(sanitizeText)) {
          const ok = drawChecklistRow(item);
          if (!ok) break;
        }

        y -= 6;
      }

      drawFooter(page, pageNum++, font, reportRef);
    }

    /**
     * ------------------------------
     * About Resiliscore
     * ------------------------------
     */
    {
      const page = addPage(pdfDoc);
      drawBrandHeader(page, shieldImg);
      drawWatermark(page, watermarkImg, 0.12);

      const { height } = page.getSize();
      let y = height - 96;
      drawSectionTitle(page, "About Resiliscore", 50, y, fontBold);
      y -= 30;

      const intro =
        "Resiliscore is a cyber resilience maturity assessment designed for SMEs. It helps organisations understand their current resilience posture, prioritise improvements, and communicate control maturity in a clearer, more structured way.";

      for (const line of wrapText(intro, 102)) {
        page.drawText(line, { x: 50, y, size: 10.5, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
      }

      y -= 10;

      page.drawText("Resiliscore helps organisations:", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const helps = [
        "Understand their current resilience posture",
        "Prioritise improvements that reduce disruption risk",
        "Translate controls into recognised frameworks",
        "Demonstrate security maturity to customers and suppliers",
      ];

      for (const item of helps) {
        for (const line of wrapText(`• ${item}`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
      }

      y -= 10;

      page.drawText("How to use this report:", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 14;

      const services = [
        "Use it to understand your current resilience posture",
        "Use it to prioritise the next improvements that matter most",
        "Use it to support internal planning and decision-making",
        "Use it to respond to customer and supplier assurance questions with more confidence",
      ];

      for (const item of services) {
        for (const line of wrapText(`• ${item}`, 100)) {
          page.drawText(line, { x: 50, y, size: 10.5, font, color: BRAND.text });
          y -= 14;
        }
      }

      y -= 12;
      page.drawText("Contact", {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: BRAND.text,
      });
      y -= 16;
      page.drawText("hello@resiliscore.co.uk", {
        x: 50,
        y,
        size: 10.5,
        font,
        color: BRAND.text,
      });

      drawFooter(page, pageNum++, font, reportRef);
    }

    const pdfBytes = await pdfDoc.save();

    const safeCompany = companyName
      ? companyName.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40)
      : "";

    const filename = safeCompany
      ? `resiliscore-${safeCompany}-${reportRef}.pdf`
      : `resiliscore-${reportRef}.pdf`;

    const filePath = `${assessment.id}/${filename}`;

    const uploadResult = await supabase.storage.from("reports").upload(filePath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (uploadResult.error) {
      throw new Error(`Supabase upload failed: ${uploadResult.error.message}`);
    }

    await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        reportUrl: filePath,
        reportGeneratedAt: new Date(),
        reportEmail: assessment.email ?? null,
      },
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "PDF generation failed",
        detail: sanitizeText(String(err?.message ?? err)),
      },
      { status: 500 }
    );
  }
}