// src/app/api/assessments/[id]/pdf/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    : null;

/**
 * ------------------------------
 * Brand + layout constants
 * ------------------------------
 */
const A4: [number, number] = [595.28, 841.89];

const BRAND = {
  // Backgrounds
  bg: rgb(0.965, 0.97, 0.99),
  white: rgb(1, 1, 1),
  card: rgb(0.982, 0.986, 0.998),

  // Header / primary brand
  headerBg: rgb(0.12, 0.05, 0.28),        // deep purple
  headerGlow: rgb(0.25, 0.55, 1.0),       // electric blue glow

  // Core accent
  accent: rgb(0.13, 0.45, 0.92),          // primary blue
  accentSoft: rgb(0.91, 0.95, 1.0),
  accentLine: rgb(0.72, 0.82, 0.98),

  // Text
  text: rgb(0.07, 0.09, 0.12),
  muted: rgb(0.40, 0.46, 0.52),

  // Structure
  line: rgb(0.86, 0.89, 0.94),

  // Status
  good: rgb(0.18, 0.76, 0.64),            // teal
  med: rgb(0.93, 0.66, 0.20),             // amber
  risk: rgb(0.84, 0.33, 0.67),            // pink-magenta

  // Tinted surfaces
  greenTint: rgb(0.93, 0.985, 0.97),
  amberTint: rgb(0.998, 0.978, 0.93),
  redTint: rgb(0.992, 0.95, 0.975),
  blueTint: rgb(0.94, 0.965, 1.0),
};

/**
 * ------------------------------
 * Benchmark + Breach Cost Logic
 * ------------------------------
 */

function estimateBreachCost(overall: number, weakestDomains: string[]) {
  let base = 25000;

  if (overall < 2) base = 120000;
  else if (overall < 3) base = 70000;
  else if (overall < 4) base = 35000;
  else base = 15000;

  if (weakestDomains.some(d => d.toLowerCase().includes("identity"))) base *= 1.2;
  if (weakestDomains.some(d => d.toLowerCase().includes("recovery"))) base *= 1.15;
  if (weakestDomains.some(d => d.toLowerCase().includes("incident"))) base *= 1.15;

  const low = Math.round(base * 0.7);
  const high = Math.round(base * 1.6);

  return {
    low,
    high,
    mid: Math.round((low + high) / 2),
  };
}

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
    y: height - 60,
    width,
    height: 60,
    color: BRAND.headerBg,
  });

  page.drawRectangle({
    x: 0,
    y: height - 60,
    width,
    height: 60,
    color: BRAND.headerGlow,
    opacity: 0.08,
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
    color: BRAND.line,
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
    opacity: clamp(opacity, 0.02, 0.12),
  });
}

function drawSectionTitle(page: any, title: string, x: number, y: number, fontBold: any) {
  page.drawText(sanitizeText(title), {
    x,
    y,
    size: 12,
    font: fontBold,
    color: BRAND.text,
  });

  page.drawLine({
    start: { x, y: y - 8 },
    end: { x: 545, y: y - 8 },
    thickness: 1,
    color: BRAND.line,
  });
}

function drawBar(page: any, x: number, y: number, w: number, h: number, pct: number) {
  const safePct = clamp(pct, 0, 1);
  const r = h / 2;

  const trackColor = rgb(0.95, 0.96, 0.985);
  const trackBorder = BRAND.line;
  const fillColor = BRAND.accent;

  page.drawRectangle({
    x: x + r,
    y,
    width: Math.max(0, w - h),
    height: h,
    color: trackColor,
    borderColor: trackBorder,
    borderWidth: 1,
  });

  page.drawCircle({
    x: x + r,
    y: y + r,
    size: r,
    color: trackColor,
    borderColor: trackBorder,
    borderWidth: 1,
  });

  page.drawCircle({
    x: x + w - r,
    y: y + r,
    size: r,
    color: trackColor,
    borderColor: trackBorder,
    borderWidth: 1,
  });

  const fillW = w * safePct;
  if (fillW <= 0) return;

  if (fillW <= h) {
    page.drawCircle({
      x: x + r,
      y: y + r,
      size: Math.max(fillW / 2, r * 0.55),
      color: fillColor,
    });
    return;
  }

  page.drawCircle({
    x: x + r,
    y: y + r,
    size: r,
    color: fillColor,
  });

  page.drawRectangle({
    x: x + r,
    y,
    width: Math.max(0, fillW - r),
    height: h,
    color: fillColor,
  });

  page.drawCircle({
    x: x + fillW - r,
    y: y + r,
    size: r,
    color: fillColor,
  });
}

function drawRoundedCard(
  page: any,
  x: number,
  y: number,
  w: number,
  h: number,
  opts?: {
    fill?: ReturnType<typeof rgb>;
    border?: ReturnType<typeof rgb>;
    radius?: number;
    borderWidth?: number;
  }
) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: opts?.fill ?? BRAND.card,
    borderColor: opts?.border ?? BRAND.line,
    borderWidth: opts?.borderWidth ?? 1,
    borderRadius: opts?.radius ?? 16,
  });
}

function drawLabel(page: any, text: string, x: number, y: number, fontBold: any) {
  page.drawText(sanitizeText(text), {
    x,
    y,
    size: 8.5,
    font: fontBold,
    color: BRAND.muted,
  });
}

function drawMetricCard(
  page: any,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  sub: string,
  font: any,
  fontBold: any
) {
  drawRoundedCard(page, x, y, w, h, {
    fill: BRAND.white,
    border: BRAND.line,
    radius: 18,
  });

  drawLabel(page, label, x + 14, y + h - 18, fontBold);

  page.drawText(sanitizeText(value), {
    x: x + 14,
    y: y + h - 52,
    size: 24,
    font: fontBold,
    color: BRAND.text,
  });

  page.drawText(sanitizeText(sub), {
    x: x + 14,
    y: y + 14,
    size: 9.5,
    font,
    color: BRAND.muted,
  });
}

function drawInsightCard(
  page: any,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  lines: string[],
  font: any,
  fontBold: any,
  accent?: ReturnType<typeof rgb>
) {
  const borderColor = accent ?? BRAND.accent;
  const fillColor =
    borderColor === BRAND.risk
      ? BRAND.redTint
      : borderColor === BRAND.med
      ? BRAND.amberTint
      : borderColor === BRAND.good
      ? BRAND.greenTint
      : BRAND.blueTint;

  drawRoundedCard(page, x, y, w, h, {
    fill: fillColor,
    border: borderColor,
    radius: 18,
  });

  page.drawRectangle({
    x: x + 12,
    y: y + h - 18,
    width: 34,
    height: 5,
    color: borderColor,
  });

  page.drawText(sanitizeText(title), {
    x: x + 14,
    y: y + h - 36,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  let ly = y + h - 58;
  const minY = y + 16;

  for (const raw of lines) {
    const wrapped = wrapText(raw, 34);

    for (const line of wrapped) {
      if (ly < minY) return;

      page.drawText(sanitizeText(line), {
        x: x + 14,
        y: ly,
        size: 8.5,
        font,
        color: BRAND.text,
      });

      ly -= 11;
    }

    ly -= 3;
    if (ly < minY) return;
  }
}

function drawSectionIntro(page: any, text: string, x: number, y: number, font: any) {
  let cy = y;
  for (const line of wrapText(text, 102)) {
    page.drawText(line, {
      x,
      y: cy,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    cy -= 14;
  }
  return cy;
}

function drawMiniScorePill(
  page: any,
  x: number,
  y: number,
  text: string,
  fontBold: any,
  fill?: ReturnType<typeof rgb>,
  textColor?: ReturnType<typeof rgb>
) {
  drawRoundedCard(page, x, y, 74, 24, {
    fill: fill ?? BRAND.accentSoft,
    border: BRAND.accentLine,
    radius: 999,
  });

  page.drawText(sanitizeText(text), {
    x: x + 13,
    y: y + 7,
    size: 9,
    font: fontBold,
    color: textColor ?? BRAND.text,
  });
}

function getActionExplanation(item: string, phase: "d30" | "d60" | "d90") {
  const t = sanitizeText(item).toLowerCase();

  if (t.includes("assign owners")) {
    return "Ownership is the fastest way to turn risk discussion into delivery. Without named owners, important actions usually drift.";
  }
  if (t.includes("mfa")) {
    return "Multi-factor authentication reduces the likelihood of account compromise, which remains one of the most common SME breach routes.";
  }
  if (t.includes("restore test") || t.includes("backups run")) {
    return "Backups only reduce business risk if recovery actually works in practice. Testing removes false confidence.";
  }
  if (t.includes("risk register")) {
    return "A simple risk register gives leadership a shared view of what matters most, who owns it, and what is still unresolved.";
  }
  if (t.includes("tabletop exercise") || t.includes("exercise")) {
    return "Testing scenarios exposes ambiguity before a real incident does. It improves response speed and decision-making under pressure.";
  }
  if (t.includes("patch") || t.includes("vulnerability")) {
    return "A defined remediation routine reduces preventable exposure and shows that weaknesses are being tracked to closure.";
  }
  if (t.includes("evidence")) {
    return "Evidence is what turns claimed controls into credible controls. It also helps with insurers, clients, and audit conversations.";
  }
  if (t.includes("supplier")) {
    return "Third-party weaknesses can still disrupt your business. Supplier visibility and review help reduce inherited risk.";
  }
  if (t.includes("access review")) {
    return "Access reviews reduce unnecessary privilege and help confirm that sensitive systems are not relying on outdated permissions.";
  }
  if (t.includes("inventory") || t.includes("asset")) {
    return "You cannot prioritise protection or recovery properly if critical systems and data are not clearly identified.";
  }

  if (phase === "d30") {
    return "This action is intended to reduce immediate exposure and create enough structure to start moving the weakest areas upward quickly.";
  }
  if (phase === "d60") {
    return "This action helps move from intention to operating discipline, so that controls can be shown to work consistently in practice.";
  }

  return "This action is aimed at embedding stronger routines, clearer evidence, and simple measurement so progress can be sustained over time.";
}

function drawExplanatoryPlanItem(
  page: any,
  item: string,
  phase: "d30" | "d60" | "d90",
  x: number,
  y: number,
  widthChars: number,
  font: any,
  fontBold: any
) {
  let cy = y;

  const titleLines = wrapText(item, widthChars);
  for (const line of titleLines) {
    page.drawText(`• ${sanitizeText(line)}`, {
      x,
      y: cy,
      size: 10.5,
      font: fontBold,
      color: BRAND.text,
    });
    cy -= 14;
  }

  const explainer = getActionExplanation(item, phase);
  for (const line of wrapText(explainer, widthChars - 4)) {
    page.drawText(line, {
      x: x + 14,
      y: cy,
      size: 9.5,
      font,
      color: BRAND.muted,
    });
    cy -= 12;
  }

  return cy - 4;
}

function severityColor(score: number) {
  if (score < 1.5) return BRAND.risk;
  if (score < 2.5) return BRAND.med;
  return BRAND.good;
}

function drawTrafficLight(page: any, x: number, y: number, band: ReturnType<typeof scoreBand>, fontBold: any, font: any) {
  const r = 6;
  const gap = 18;

  const colors = {
    red: BRAND.risk,
    amber: BRAND.med,
    green: BRAND.good,
    grey: rgb(0.82, 0.84, 0.88),
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
  page.drawCircle({ x: x + r + gap * 2, y: y, size: r, color: c3 });

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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const token = new URL(req.url).searchParams.get("token");
    if ( !token || token !== assessment.downloadToken) {
       return NextResponse.json({ error:"unauthorized" }, { status: 403 });
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

//   if (assessment.reportUrl) {

//  if (!supabase) {
//    throw new Error("Supabase client not configured");
//  }

//  const existing = await supabase.storage
//    .from("reports")
//    .download(assessment.reportUrl);

//   if (!existing.error && existing.data) {
//     const existingBytes = await existing.data.arrayBuffer();

//     const existingFilename =
//       assessment.reportUrl.split("/").pop() || `resiliscore-${assessment.id}.pdf`;

//     return new NextResponse(existingBytes, {
//       status: 200,
//       headers: {
//        "Content-Type": "application/pdf",
//        "Content-Disposition": `attachment; filename="${existingFilename}"`,
//        "Cache-Control": "no-store",
//      },
//    });
//   }
// }

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
 * Cover page
 * ------------------------------
 */
{
  const page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.06);

  const { height, width } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: BRAND.bg,
  });

  drawBrandHeader(page, shieldImg);

  page.drawText("RESILISCORE", {
    x: 50,
    y: height - 142,
    size: 30,
    font: fontBold,
    color: BRAND.text,
  });

  page.drawText("Cyber Resilience Assessment Report", {
    x: 50,
    y: height - 178,
    size: 19,
    font: fontBold,
    color: BRAND.text,
  });

  page.drawText("A structured maturity snapshot designed for SMEs", {
    x: 50,
    y: height - 198,
    size: 10.5,
    font,
    color: BRAND.muted,
  });

  page.drawRectangle({
    x: 50,
    y: height - 220,
    width: 220,
    height: 5,
    color: BRAND.accent,
  });

  drawMetricCard(
    page,
    50,
    height - 348,
    150,
    108,
    "Overall score",
    `${overall.toFixed(2)} / 5`,
    scoreLabel(overall),
    font,
    fontBold
  );

  drawMetricCard(
    page,
    214,
    height - 348,
    110,
    108,
    "Grade",
    grade,
    "Maturity band",
    font,
    fontBold
  );

  drawRoundedCard(page, 338, height - 348, 207, 108, {
    fill: BRAND.white,
    border: BRAND.line,
    radius: 18,
  });

  drawLabel(page, "Assessment details", 352, height - 258, fontBold);

  let infoY = height - 282;

  if (companyName) {
    page.drawText("Company", {
      x: 352,
      y: infoY,
      size: 9,
      font: fontBold,
      color: BRAND.muted,
    });
    page.drawText(companyName, {
      x: 430,
      y: infoY,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    infoY -= 18;
  }

  page.drawText("Date", {
    x: 352,
    y: infoY,
    size: 9,
    font: fontBold,
    color: BRAND.muted,
  });
  page.drawText(assessmentDate, {
    x: 430,
    y: infoY,
    size: 10.5,
    font,
    color: BRAND.text,
  });
  infoY -= 18;

  page.drawText("Reference", {
    x: 352,
    y: infoY,
    size: 9,
    font: fontBold,
    color: BRAND.muted,
  });
  page.drawText(reportRef, {
    x: 430,
    y: infoY,
    size: 10.5,
    font,
    color: BRAND.text,
  });

  // Start the explanatory section directly under the 3 score cards
  let y = 430;

  page.drawText("How to read and use this report", {
    x: 50,
    y,
    size: 12,
    font: fontBold,
    color: BRAND.text,
  });

  page.drawLine({
    start: { x: 50, y: y - 8 },
    end: { x: 545, y: y - 8 },
    thickness: 1,
    color: BRAND.line,
  });

  y -= 26;

  const intro = [
    "This report highlights your resilience visibility gap: the difference between what the business believes is in place and what it can actually prove under pressure.",
    "It is designed to show where disruption is most likely to begin, why that matters commercially, and what to improve first.",
  ];

  for (const paragraph of intro) {
    for (const line of wrapText(paragraph, 100)) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10.5,
        font,
        color: BRAND.text,
      });
      y -= 14;
    }
    y -= 4;
  }

  y -= 4;

  page.drawText("What this report shows", {
    x: 50,
    y,
    size: 10.5,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 18;

  const shows = [
    "Your overall resilience score and maturity level",
    "Stronger and weaker domains across your business",
    "Priority risks and where disruption is most likely to originate",
    "Clear actions to improve resilience over the next 30-90 days",
  ];

  for (const item of shows) {
    for (const line of wrapText(item, 100)) {
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

  page.drawText("What your score means", {
    x: 50,
    y,
    size: 10.5,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 18;

  const scoreMeaning = [
    "The score reflects how consistently controls are applied across your business.",
    "It is not about having everything in place, but about reliability, ownership, and evidence.",
    "Lower scores typically indicate higher dependency on individuals or informal processes.",
  ];

  for (const item of scoreMeaning) {
    for (const line of wrapText(item, 100)) {
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

  page.drawText("How to use this report", {
    x: 50,
    y,
    size: 10.5,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 18;

  const usage = [
    "Focus first on your lowest 2-3 domains rather than trying to improve everything at once.",
    "Prioritise ownership, routine, and evidence before introducing complexity.",
    "Use this report to guide internal discussions and prioritise practical improvements.",
  ];

  for (const item of usage) {
    for (const line of wrapText(item, 100)) {
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
 * Key findings
 * ------------------------------
 */
{
  const page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.12);

  const { height } = page.getSize();
  let y = height - 96;
  drawSectionTitle(page, "Resilience diagnosis", 50, y, fontBold);
  y -= 30;

  const strongestNames = topStrengths.map((d) =>
    shortDomainLabel(d.domain_name || d.domain_code || "Domain")
  );
  const weakestNames = topRisks.map((d) =>
    shortDomainLabel(d.domain_name || d.domain_code || "Domain")
  );

  const posture =
    `Your organisation currently sits at ${overall.toFixed(2)} / 5, which places it in the ${scoreLabel(overall)} maturity range. ` +
    (strongestNames.length
      ? `Relative strengths are more visible in ${strongestNames.join(", ")}. `
      : "") +
    (weakestNames.length
      ? `The greatest resilience pressure is currently concentrated in ${weakestNames.join(", ")}.`
      : "There are weaker domains that should be treated as priority areas.");

  page.drawText("Current resilience diagnosis", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 16;

  for (const line of wrapText(posture, 102)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 14;
  }

  y -= 12;

      drawInsightCard(
    page,
    50,
    y - 156,
    155,
    144,
    "What stands out",
    [
      "The results suggest resilience is uneven across the business rather than uniformly weak or strong.",
      "This usually means disruption risk is concentrated in a few avoidable areas rather than everywhere at once.",
    ],
    font,
    fontBold,
    BRAND.accent
  );

  drawInsightCard(
    page,
    220,
    y - 156,
    155,
    144,
    "Main pressure points",
    topRisks.map(
      (d) =>
        `${shortDomainLabel(d.domain_name || d.domain_code || "Domain")} (${Number(
          d.score ?? 0
        ).toFixed(2)} / 5)`
    ),
    font,
    fontBold,
    BRAND.risk
  );

  drawInsightCard(
    page,
    390,
    y - 156,
    155,
    144,
    "Stronger areas",
    topStrengths.map(
      (d) =>
        `${shortDomainLabel(d.domain_name || d.domain_code || "Domain")} (${Number(
          d.score ?? 0
        ).toFixed(2)} / 5)`
    ),
    font,
    fontBold,
    BRAND.good
  );

  y -= 194;

  page.drawText("What is likely happening today", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 14;

  const meaning = [
    "The business is unlikely to be equally exposed everywhere. The main risk is that one or two weaker areas create avoidable disruption first.",
    "Where resilience is stronger, the business is more likely to respond consistently and provide evidence quickly when asked.",
    "Where resilience is weaker, there is usually more dependence on memory, informal routines, or individual effort rather than repeatable process.",
  ];

  for (const m of meaning) {
    for (const line of wrapText(m, 100)) {
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
    const score = Number(d.score ?? 0);

    page.drawText(sanitizeText(name), {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });

    drawBar(page, 285, y - 2, 175, 8, score / 5);

    page.drawText(sanitizeText(score.toFixed(2)), {
      x: 470,
      y,
      size: 10.5,
      font: fontBold,
      color: BRAND.text,
    });

    page.drawCircle({
      x: 530,
      y: y + 4,
      size: 4.5,
      color: severityColor(score),
    });

    y -= 20;
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

  const immediateActions = keyFindingActions.length
    ? keyFindingActions
    : [
        "Enforce MFA for privileged and cloud accounts.",
        "Track vulnerabilities to closure.",
        "Establish clear asset ownership.",
      ];

  for (const a of immediateActions) {
    for (const line of wrapText(a, 100)) {
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
 * Executive summary
 * ------------------------------
 */
{
  const page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.08);

  const { height } = page.getSize();
  let y = height - 96;
  drawSectionTitle(page, "Brutal truth", 50, y, fontBold);
  y -= 26;

  const weakestNames = topRisks.map((d) => shortDomainLabel(d.domain_name || d.domain_code || "Domain"));
  const strongestNames = topStrengths.map((d) => shortDomainLabel(d.domain_name || d.domain_code || "Domain"));

  y = drawSectionIntro(
    page,
    "If nothing changes, the most likely outcome is not total collapse but avoidable disruption starting in one or two weak areas. This page shows where that pressure is most likely to surface first.",
    50,
    y,
    font
  );

  y -= 10;

  drawMetricCard(
    page,
    50,
    y - 104,
    146,
    104,
    "Overall score",
    `${overall.toFixed(2)} / 5`,
    "Out of 5",
    font,
    fontBold
  );

  drawMetricCard(
    page,
    208,
    y - 104,
    146,
    104,
    "Grade",
    grade,
    scoreLabel(overall),
    font,
    fontBold
  );

  drawMetricCard(
    page,
    366,
    y - 104,
    179,
    104,
    "Risk signal",
    scoreBand(overall).replace("_", " "),
    "Relative resilience position",
    font,
    fontBold
  );

  y -= 126;

  page.drawText("If nothing changes", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 16;

  const posture =
    `This assessment indicates that your organisation currently operates at a ${scoreLabel(overall)} maturity level ` +
    `(${overall.toFixed(2)} / 5), with the most significant exposure concentrated in ` +
    `${weakestNames.length ? weakestNames.join(", ") : "its weaker domains"}. ` +
    `These areas are the most likely sources of disruption if not addressed.`;

  for (const line of wrapText(posture, 102)) {
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

  const band = scoreBand(overall);
  const execCopy =
    band === "very_low"
      ? [
          "Controls are limited or not operating consistently day-to-day.",
          "Fast wins usually come from ownership, MFA, backup restore testing, and a simple risk register.",
          "Reduce disruption risk first, then turn improvements into repeatable routines.",
        ]
      : band === "low"
      ? [
          "Some controls exist, but consistency and evidence may still be patchy.",
          "Prioritise the weakest 2-3 domains and make them routine, owned, and evidenced.",
          "Add simple measurement such as restore success and patch timeliness.",
        ]
      : band === "mid"
      ? [
          "Defined practices exist, but some domains still need more consistency and proof.",
          "Lift the weakest domains first to reduce single points of failure.",
          "Use testing, evidence, and simple KPIs to stop maturity drift.",
        ]
      : band === "high"
      ? [
          "Good consistency exists across most domains.",
          "Biggest gains now are tighter assurance, testing, and exception control.",
          "Keep standards strong through growth, supplier change, and new systems.",
        ]
      : [
          "Strong maturity foundations are in place.",
          "Focus now is optimisation, assurance, and reducing hidden risk.",
          "Maintain resilience by embedding controls into business change.",
        ];

  drawInsightCard(
    page,
    50,
    y - 146,
    155,
    134,
    "Overall meaning",
    execCopy.slice(0, 2),
    font,
    fontBold,
    BRAND.accent
  );

  drawInsightCard(
    page,
    220,
    y - 146,
    155,
    134,
    "Top priorities",
    topRisks.map(
      (d) => `${shortDomainLabel(d.domain_name || d.domain_code || "Domain")}: ${Number(d.score ?? 0).toFixed(2)} / 5`
    ),
    font,
    fontBold,
    BRAND.risk
  );

  drawInsightCard(
    page,
    390,
    y - 146,
    155,
    134,
    "Top strengths",
    topStrengths.map(
      (d) => `${shortDomainLabel(d.domain_name || d.domain_code || "Domain")}: ${Number(d.score ?? 0).toFixed(2)} / 5`
    ),
    font,
    fontBold,
    BRAND.good
  );

  y -= 182;

  page.drawText("Why this creates pressure", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 16;

  const practicalPoints = [
    weakestNames.length
      ? `The greatest risk to business continuity is currently concentrated in ${weakestNames.join(", ")}.`
      : "The greatest risk to business continuity is concentrated in the lowest-scoring domains.",
    strongestNames.length
      ? `Relative stability is more visible in ${strongestNames.join(", ")}.`
      : "Some domains are stronger and can be used as a baseline for improvement elsewhere.",
    "The fastest improvement usually comes from lifting the weakest areas first rather than trying to improve everything at once.",
  ];

  for (const p of practicalPoints) {
    for (const line of wrapText(p, 102)) {
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

  y -= 4;

  page.drawText("Weakest domains ranked", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 16;

  for (const d of topRisks) {
    const name = d.domain_name || d.domain_code || "Domain";
    const score = Number(d.score ?? 0);
    const color = severityColor(score);

    page.drawText(sanitizeText(name), {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });

    drawBar(page, 285, y - 2, 175, 8, score / 5);

    page.drawText(sanitizeText(score.toFixed(2)), {
      x: 470,
      y,
      size: 10.5,
      font: fontBold,
      color: BRAND.text,
    });

    page.drawCircle({
      x: 530,
      y: y + 4,
      size: 4.5,
      color,
    });

    y -= 20;
  }

  drawFooter(page, pageNum++, font, reportRef);
}

/**
 * ------------------------------
 * Business Risk Summary & Practical Impact
 * ------------------------------
 */
{
  const page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.10);

  const { height } = page.getSize();
  let y = height - 96;

  drawSectionTitle(page, "Business impact summary", 50, y, fontBold);
  y -= 28;

  const weakest = topRisks.map((d) => d.domain_name || d.domain_code || "Domain");
  const weakestShort = topRisks.map((d) =>
    shortDomainLabel(d.domain_name || d.domain_code || "Domain")
  );
  
  const intro =
    "This section explains the operational pressure your current gaps are most likely to create. It focuses on downtime, slower decisions, recovery difficulty, and external assurance pressure rather than a made-up loss figure.";

  for (const line of wrapText(intro, 100)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 14;
  }

  y -= 12;

  const exposureCardY = y - 140;

  drawRoundedCard(page, 50, exposureCardY, 495, 106, {
    fill: BRAND.white,
    border: BRAND.line,
    radius: 18,
  });

  page.drawText("Most likely business impact", {
    x: 64,
    y: exposureCardY + 78,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  const impactLines = [
    "More downtime than necessary.",
    "Slower decisions during disruption.",
    "More difficulty answering clients, insurers, or partners with confidence.",
  ];

  let ecy = exposureCardY + 52;
  for (const line of impactLines) {
    for (const l of wrapText(line, 70)) {
      page.drawText(l, {
        x: 64,
        y: ecy,
        size: 10.5,
        font,
        color: BRAND.text,
      });
      ecy -= 14;
    }
  }

  y = exposureCardY - 20;

  drawInsightCard(
    page,
    50,
    y - 140,
    155,
    128,
    "Main pressure points",
    weakestShort.length
      ? weakestShort.map((d) => `Higher exposure: ${d}`)
      : ["Exposure is concentrated in the lowest-scoring domains."],
    font,
    fontBold,
    BRAND.risk
  );

  drawInsightCard(
    page,
    220,
    y - 140,
    155,
    128,
    "Commercial effect",
    [
      "More downtime and slower decisions during disruption.",
      "Higher recovery effort and rework.",
      "More difficulty answering external assurance questions.",
    ],
    font,
    fontBold,
    BRAND.med
  );

  drawInsightCard(
    page,
    390,
    y - 140,
    155,
    128,
    "What improves this",
    [
      "Lift the weakest domains first.",
      "Make controls routine, owned, and evidenced.",
      "Prove that recovery and response work in practice.",
    ],
    font,
    fontBold,
    BRAND.good
  );

  y -= 172;

  page.drawText("Likely business disruption scenarios", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 16;

  const disruptionScenarios = topRisks.map((d) => {
    const name = shortDomainLabel(d.domain_name || d.domain_code || "Domain");
    const key = `${d.domain_name || d.domain_code || ""}`.toLowerCase();

    if (key.includes("identity") || key.includes("access")) {
      return `${name}: account compromise or poor access control could disrupt email, cloud systems, or privileged access.`;
    }
    if (key.includes("recovery") || key.includes("resilience")) {
      return `${name}: weak recovery arrangements could increase downtime and make restoration slower or less certain.`;
    }
    if (key.includes("incident") || key.includes("response")) {
      return `${name}: unclear response roles or escalation could delay containment and increase disruption impact.`;
    }
    if (key.includes("operations")) {
      return `${name}: inconsistent day-to-day controls could allow routine weaknesses to become visible only when something goes wrong.`;
    }
    if (key.includes("supplier") || key.includes("third")) {
      return `${name}: supplier or third-party weaknesses could create service interruption or assurance issues.`;
    }
    if (key.includes("threat") || key.includes("vulnerability")) {
      return `${name}: unresolved technical weaknesses could leave the business open to preventable attack paths.`;
    }
    if (key.includes("asset") || key.includes("data")) {
      return `${name}: weak visibility over critical systems or data could slow protection and recovery decisions.`;
    }
    if (key.includes("governance")) {
      return `${name}: weak ownership or leadership cadence could allow important issues to remain unresolved for too long.`;
    }
    if (key.includes("risk")) {
      return `${name}: known issues may stay open too long if they are not tracked clearly enough.`;
    }

    return `${name}: this lower-scoring area is more likely to contribute to disruption if not improved.`;
  });

  for (const item of disruptionScenarios) {
    for (const line of wrapText(item, 100)) {
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

  y -= 6;

  page.drawText("How to use this page", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 14;

  const closing = [
    "The purpose of this page is to show the type of pressure weak resilience usually creates in an SME.",
    "Use it to focus leadership on practical disruption risk rather than theoretical cyber language.",
    "The best way to reduce this exposure is usually to improve the weakest 2-3 domains first, rather than trying to improve everything at once.",
  ];

  for (const item of closing) {
    for (const line of wrapText(item, 100)) {
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
  drawSectionTitle(page, "Framework alignment (plain English)", 50, y, fontBold);
  y -= 30;

  const intro =
    "Resiliscore includes framework alignment so SMEs can translate resilience improvements into language that customers, insurers, auditors, and procurement teams recognise. This is not a certification page. It is here to show how practical resilience work can also support external assurance.";
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

  page.drawText("Why framework alignment matters", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 14;

  const why = [
    "Many SMEs are asked security questions by clients, partners, insurers, or procurement teams before work can progress.",
    "Recognised framework language helps explain your controls in a way external stakeholders already understand.",
    "This makes it easier to reuse evidence, answer due diligence questions faster, and justify improvement priorities internally.",
  ];

  for (const b of why) {
    for (const line of wrapText(b, 102)) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10.5,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 14;
    }
    y -= 2;
  }

  y -= 8;

  page.drawText("How the alignment works in practice", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 14;

  const how = [
    "Each assessment area is linked in the background to recognised framework themes such as access control, backups, incident response, supplier assurance, and recovery.",
    "When you improve one of the actions in your report, you are usually strengthening a recognised control area at the same time.",
    "This means the report can support both internal resilience planning and external assurance conversations without turning the whole exercise into a compliance project.",
  ];

  for (const b of how) {
    for (const line of wrapText(b, 102)) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10.5,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 14;
    }
    y -= 2;
  }

  y -= 10;

      drawInsightCard(
    page,
    50,
    y - 154,
    155,
    142,
    "NIST CSF",
    [
      "Useful for explaining cyber outcomes in a practical structure.",
      "Helps frame work around identify, protect, detect, respond, and recover.",
    ],
    font,
    fontBold,
    BRAND.accent
  );

  drawInsightCard(
    page,
    220,
    y - 154,
    155,
    142,
    "ISO themes",
    [
      "Useful for showing recognised control areas such as policy, access, operations, suppliers, and incident handling.",
      "Helpful in client and supplier assurance discussions.",
    ],
    font,
    fontBold,
    BRAND.med
  );

  drawInsightCard(
    page,
    390,
    y - 154,
    155,
    142,
    "Commercial benefit",
    [
      "Helps SMEs answer questions faster, reuse evidence, and present a more credible security position.",
      "Supports due diligence without making the report feel compliance-led.",
    ],
    font,
    fontBold,
    BRAND.good
  );

  y -= 190;

  page.drawText("What this means for an SME", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 14;

  const sme = [
    "You do not need to become a framework expert to benefit from this alignment.",
    "The main value is that your practical improvements can also be described in a more recognised and credible way.",
    "This reduces friction when buyers, insurers, or partners ask how your business manages cyber risk.",
  ];

  for (const b of sme) {
    for (const line of wrapText(b, 102)) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10.5,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 14;
    }
    y -= 2;
  }

  y -= 8;

  page.drawText("Important note", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 14;

  const note =
    "Framework alignment is included to support reporting, communication, and credibility. Resiliscore is not a certification, formal audit, or replacement for specialist compliance advice. It is a practical resilience tool with recognised structure in the background.";
  for (const line of wrapText(note, 102)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 14;
  }

  drawFooter(page, pageNum++, font, reportRef);
}

/**
 * ------------------------------
 * How You Compare
 * ------------------------------
 */
{
  const page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.10);

  const { height } = page.getSize();
  let y = height - 96;

  drawSectionTitle(page, "How You Compare", 50, y, fontBold);
  y -= 28;

  const lessSecureThan = Math.max(5, Math.min(95, Math.round((1 - overall / 5) * 100)));
  const moreSecureThan = 100 - lessSecureThan;

  let benchmarkLabel = "";
  let benchmarkDesc = "";

  if (overall < 2.0) {
    benchmarkLabel = "Your current level appears below what is typically expected for a stable SME.";
    benchmarkDesc =
      "Your current resilience position appears weaker than most comparable SMEs, which suggests the business is more exposed to disruption if common weaknesses are exploited.";
  } else if (overall < 3.0) {
    benchmarkLabel = "Your current level appears below what is typically expected for a stable SME.";
    benchmarkDesc =
      "Your current position suggests a mixed resilience profile. Some controls exist, but enough gaps remain to place the business below many similar organisations.";
  } else if (overall < 4.0) {
    benchmarkLabel = "Your current level appears stronger than many SMEs, although some weaker domains still need attention.";
    benchmarkDesc =
      "Your current resilience position appears stronger than many comparable SMEs, although some weaker domains still need attention to avoid drift or avoidable disruption.";
  } else {
    benchmarkLabel = "Your current level appears stronger than many SMEs, although some weaker domains still need attention.";
    benchmarkDesc =
      "Your current resilience position appears stronger than most comparable SMEs, suggesting a more mature and more consistent operating baseline than many peers.";
  }

  page.drawText("Practical benchmark view", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 20;

  for (const line of wrapText(benchmarkLabel, 52)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 18,
      font: fontBold,
      color: BRAND.text,
    });
    y -= 22;
  }

  y -= 6;

  for (const line of wrapText(benchmarkDesc, 96)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 14;
  }

  y -= 22;

  page.drawText("Relative benchmark view", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 18;

  drawBar(page, 50, y, 430, 16, lessSecureThan / 100);

  page.drawText(`${lessSecureThan}%`, {
    x: 490,
    y: y + 2,
    size: 10,
    font: fontBold,
    color: BRAND.text,
  });

  page.drawText("Lower risk", {
    x: 50,
    y: y - 16,
    size: 9,
    font,
    color: BRAND.muted,
  });

  page.drawText("Higher risk", {
    x: 420,
    y: y - 16,
    size: 9,
    font,
    color: BRAND.muted,
  });

  y -= 42;

  drawInsightCard(
    page,
    50,
    y - 138,
    155,
    126,
    "What this means",
    [
      "This benchmark is a practical reference point, not a formal ranking.",
      "It is designed to make the result easier to interpret in business terms.",
    ],
    font,
    fontBold,
    BRAND.accent
  );

  drawInsightCard(
    page,
    220,
    y - 138,
    155,
    126,
    "How to improve it",
    [
      "The fastest gains usually come from lifting the weakest 2-3 domains first.",
      "Consistency, ownership, and evidence usually improve your position fastest.",
    ],
    font,
    fontBold,
    BRAND.med
  );

  drawInsightCard(
    page,
    390,
    y - 138,
    155,
    126,
    "Important caution",
    [
      "This is not a formal industry league table or statistical claim.",
      "Use it as a practical reference point when deciding what to improve first.",
    ],
    font,
    fontBold,
    BRAND.good
  );

  y -= 170;

  page.drawText("How to use this benchmark", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });

  y -= 16;

  const explanation = [
    "Use it as a practical reference point rather than a technical scorecard.",
    "The aim is to understand whether your resilience looks stable enough for a typical SME, not to chase a percentage for its own sake.",
    "The goal is not to chase a number on its own. The goal is to reduce the likelihood and cost of disruption by improving the areas that matter most first.",
  ];

  for (const e of explanation) {
    for (const line of wrapText(e, 100)) {
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
 * Domain risk priority (RAG view)
 * ------------------------------
 */
{
  let page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.12);

  const pageHeight = page.getSize().height;
  let y = pageHeight - 96;

  const startNewRagPage = (title?: string) => {
    drawFooter(page, pageNum++, font, reportRef);
    page = addPage(pdfDoc);
    drawBrandHeader(page, shieldImg);
    drawWatermark(page, watermarkImg, 0.12);
    y = pageHeight - 96;

    if (title) {
      drawSectionTitle(page, title, 50, y, fontBold);
      y -= 28;
    }
  };

  drawSectionTitle(page, "Domain Risk Priority (RAG View)", 50, y, fontBold);
  y -= 28;

  const intro =
    "This view highlights which resilience domains require the most immediate attention. Domains are grouped using a Red-Amber-Green model so it is easier to see where disruption risk is most concentrated.";

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

  const redDomains = ranked.filter((d) => Number(d.score ?? 0) < 2.0);
  const amberDomains = ranked.filter(
    (d) => Number(d.score ?? 0) >= 2.0 && Number(d.score ?? 0) < 3.5
  );
  const greenDomains = ranked.filter((d) => Number(d.score ?? 0) >= 3.5);

  const ensureSpace = (needed: number, continuationTitle?: string) => {
    if (y < needed) {
      startNewRagPage(continuationTitle || "Domain Risk Priority (RAG View) - Continued");
    }
  };

  const drawRagGroup = (
    title: string,
    subtitle: string,
    interpretation: string,
    color: ReturnType<typeof rgb>,
    domains: { domain_name: string; domain_code: string; score: number }[]
  ) => {
    ensureSpace(190, "Domain Risk Priority (RAG View) - Continued");

    page.drawText(sanitizeText(title), {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color,
    });
    y -= 14;

    for (const line of wrapText(subtitle, 100)) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font,
        color: BRAND.muted,
      });
      y -= 13;
    }

    y -= 2;

    for (const line of wrapText(`Interpretation: ${interpretation}`, 100)) {
      page.drawText(sanitizeText(line), {
        x: 50,
        y,
        size: 9.5,
        font: fontBold,
        color,
      });
      y -= 12;
    }

    y -= 8;

    if (!domains.length) {
      ensureSpace(110, "Domain Risk Priority (RAG View) - Continued");

      page.drawText("None at present.", {
        x: 50,
        y,
        size: 10.5,
        font,
        color: BRAND.text,
      });
      y -= 18;
    } else {
      for (const d of domains) {
        ensureSpace(120, "Domain Risk Priority (RAG View) - Continued");

        const name = d.domain_name || d.domain_code || "Domain";
        const score = Number(d.score ?? 0);

        page.drawText(sanitizeText(name), {
          x: 50,
          y,
          size: 10.5,
          font,
          color: BRAND.text,
        });

        drawBar(page, 270, y - 2, 145, 8, score / 5);

        page.drawText(sanitizeText(score.toFixed(2)), {
          x: 430,
          y,
          size: 10.5,
          font: fontBold,
          color: BRAND.text,
        });

        const shortName = shortDomainLabel(name);
        let note = "";

        if (title.startsWith("Red")) {
          note = `${shortName} is currently a priority exposure and is more likely to contribute to disruption if left unchanged.`;
        } else if (title.startsWith("Amber")) {
          note = `${shortName} shows some maturity, but consistency or evidence may still be too weak for confidence under pressure.`;
        } else {
          note = `${shortName} is relatively stronger, but still needs routine monitoring so standards do not drift.`;
        }

        y -= 14;

        for (const line of wrapText(note, 96)) {
          page.drawText(line, {
            x: 62,
            y,
            size: 9.4,
            font,
            color: BRAND.muted,
          });
          y -= 12;
        }

        y -= 6;
      }
    }

    ensureSpace(90, "Domain Risk Priority (RAG View) - Continued");

    y -= 4;
    page.drawLine({
      start: { x: 50, y },
      end: { x: 545, y },
      thickness: 1,
      color: BRAND.line,
    });
    y -= 14;
  };

  drawRagGroup(
    "Red - Priority attention",
    "These domains represent the greatest resilience exposure and should typically be prioritised first.",
    "Immediate resilience risk. These areas are most likely to create business disruption if not improved.",
    BRAND.risk,
    redDomains
  );

  drawRagGroup(
    "Amber - Improvement needed",
    "Controls exist, but they may still lack consistency, ownership, or supporting evidence.",
    "Moderate risk. These areas are partly in place but may still be fragile under pressure.",
    BRAND.med,
    amberDomains
  );

  drawRagGroup(
    "Green - Relative strength",
    "These domains demonstrate stronger operating practices relative to the rest of the organisation.",
    "Relatively stable. These areas are stronger, but still need monitoring and periodic review.",
    BRAND.good,
    greenDomains
  );

  if (y > 120) {
    const guidance =
      "Priority guidance: focus improvement efforts first on Red domains, then stabilise Amber domains, while maintaining Green domains through routine monitoring and evidence collection.";

    for (const line of wrapText(guidance, 102)) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10.5,
        font,
        color: BRAND.text,
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
          for (const line of wrapText(a, 105)) {
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
    "This plan is designed to reduce real-world disruption risk as quickly as possible. The first 30 days focus on stabilising obvious weaknesses, the next 30 days focus on proving controls work in practice, and the final 30 days focus on embedding consistency, evidence, and measurement.";
  for (const line of wrapText(intro, 100)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 14;
  }
  y -= 12;

  const blocks: {
    title: string;
    subtitle: string;
    items: string[];
    accent: ReturnType<typeof rgb>;
    phase: "d30" | "d60" | "d90";
  }[] = [
    {
      title: "Days 0-30 - Stabilise",
      subtitle:
        "Focus on immediate control gaps, ownership, and the basic actions that reduce exposure fastest.",
      items: plan306090.d30,
      accent: BRAND.risk,
      phase: "d30",
    },
    {
      title: "Days 31-60 - Control & Prove",
      subtitle:
        "Move from intention to routine. Confirm that controls are working consistently and can be evidenced.",
      items: plan306090.d60,
      accent: BRAND.med,
      phase: "d60",
    },
    {
      title: "Days 61-90 - Embed & Measure",
      subtitle:
        "Turn short-term fixes into repeatable operating practice, with simple evidence and reporting in place.",
      items: plan306090.d90,
      accent: BRAND.good,
      phase: "d90",
    },
  ];

  for (const b of blocks) {
    if (y < 160) break;

    page.drawText(sanitizeText(b.title), {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: b.accent,
    });
    y -= 14;

    for (const line of wrapText(b.subtitle, 100)) {
      page.drawText(line, {
        x: 50,
        y,
        size: 10,
        font,
        color: BRAND.muted,
      });
      y -= 13;
    }

    y -= 8;

    for (const item of b.items.slice(0, 4)) {
      y = drawExplanatoryPlanItem(page, item, b.phase, 50, y, 98, font, fontBold);
      if (y < 150) break;
    }

    y -= 8;
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
  const weakestNames = topRisks.map((d) =>
    shortDomainLabel(d.domain_name || d.domain_code || "Domain")
  );
  const strongestNames = topStrengths.map((d) =>
    shortDomainLabel(d.domain_name || d.domain_code || "Domain")
  );

  const intro =
    overallBand === "very_low"
      ? "Your assessment suggests resilience is currently too dependent on individuals, informal workarounds, or assumptions rather than consistent operating practice. In this position, issues may remain hidden until they become commercially disruptive."
      : overallBand === "low"
      ? "Your assessment suggests some controls exist, but resilience may still depend too heavily on whether the right people remember to do the right things at the right time. This creates avoidable fragility and increases the chance of preventable disruption."
      : overallBand === "mid"
      ? "Your assessment suggests there is a meaningful baseline in place, but some domains may still be too inconsistent to give leadership full confidence during a real incident, outage, or supplier-led disruption."
      : overallBand === "high"
      ? "Your assessment suggests the business has a solid resilience foundation. The main challenge now is proving consistency, reducing exceptions, and making sure growth or operational change does not weaken control maturity."
      : "Your assessment suggests strong resilience foundations. The opportunity now is to preserve that maturity through growth, supplier change, and ongoing assurance so standards do not drift over time.";

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

  y -= 12;

  drawInsightCard(
    page,
    50,
    y - 152,
    155,
    140,
    "Current position",
    [
      `Overall score: ${overall.toFixed(2)} / 5`,
      `Grade: ${grade}`,
      `Maturity level: ${scoreLabel(overall)}`,
    ],
    font,
    fontBold,
    BRAND.accent
  );

  drawInsightCard(
    page,
    220,
    y - 152,
    155,
    140,
    "Pressure points",
    weakestNames.length
      ? weakestNames.map((n) => `Priority area: ${n}`)
      : ["There are weaker domains that should be treated as priority areas."],
    font,
    fontBold,
    BRAND.risk
  );

  drawInsightCard(
    page,
    390,
    y - 152,
    155,
    140,
    "Relative strengths",
    strongestNames.length
      ? strongestNames.map((n) => `Stronger area: ${n}`)
      : ["No clear strengths identified."],
    font,
    fontBold,
    BRAND.good
  );

  y -= 178;

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
      ? `The greatest resilience pressure is currently likely to come from ${weakestNames.join(", ")}.`
      : "There are weaker domains that should be treated as the main priority areas.",
    "This usually means some controls may exist in principle, but they may not yet be routine, owned clearly enough, evidenced reliably enough, or tested strongly enough.",
    "In practice, the commercial risk is not only the cyber event itself. It is also delay, confusion, rework, poor communication, weak evidence, and slower recovery when something goes wrong.",
    strongestNames.length
      ? `The stronger parts of your profile, such as ${strongestNames.join(", ")}, suggest there are already some foundations the business can build on.`
      : "There may still be useful foundations in place, even if they are not yet consistent enough across the whole business.",
    "The fastest improvement usually comes from lifting the weakest domains first rather than trying to improve everything at once.",
  ];

  for (const p of profilePoints) {
    for (const line of wrapText(p, 100)) {
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

  page.drawText("What this means commercially", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 14;

  const businessImpactPoints = [
    "Where resilience is weaker, the business is more likely to suffer avoidable downtime, slower decision-making, and higher recovery cost during a disruption.",
    "Where resilience is stronger, the business is more likely to respond consistently, recover faster, and answer insurer, client, or partner questions with greater confidence.",
    "For most SMEs, the key issue is not technical perfection. It is whether the business could keep operating effectively if a common cyber or operational problem occurred tomorrow.",
  ];

  for (const p of businessImpactPoints) {
    for (const line of wrapText(p, 100)) {
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
    `Your current overall score of ${overall.toFixed(2)} / 5 and grade ${grade} indicate a maturity level of ${scoreLabel(overall)}. The next step is not more theory - it is more consistency, clearer ownership, and stronger follow-through.`,
  ];

  for (const p of consultantView) {
    for (const line of wrapText(p, 100)) {
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
      return {
        scenario:
          "Email, cloud, or admin accounts are not protected consistently enough. Access may stay active too long, MFA may not be universal, or privilege levels may be broader than the business realises.",
        exposure:
          "This can lead to account takeover, unauthorised access, internal confusion, and avoidable business disruption before the issue is fully understood.",
        fastestFix:
          "Tighten access ownership, apply MFA consistently, and make joiners, movers, and leavers a repeatable routine.",
      };
    }

    if (n.includes("recovery") || n.includes("resilience")) {
      return {
        scenario:
          "Backups may exist, but recovery confidence may be weaker than assumed because restore testing, service dependency planning, or recovery ownership is limited.",
        exposure:
          "This can lead to extended downtime, delayed recovery decisions, and greater financial damage when systems or data become unavailable.",
        fastestFix:
          "Test recovery properly, define recovery priorities, and prove that critical services can actually be restored.",
      };
    }

    if (n.includes("incident") || n.includes("response")) {
      return {
        scenario:
          "A cyber issue or operational incident occurs, but escalation routes, response roles, or decision points are not clear enough at the moment they are needed.",
        exposure:
          "This can lead to slower containment, confusion across teams, delayed communications, and a larger business impact than necessary.",
        fastestFix:
          "Define roles clearly, keep a simple response plan available, and run at least one realistic tabletop exercise.",
      };
    }

    if (n.includes("supplier") || n.includes("third-party")) {
      return {
        scenario:
          "A supplier issue affects your business because dependencies, access paths, or minimum control expectations are not visible enough or not reviewed often enough.",
        exposure:
          "This can lead to service interruption, weaker assurance, and slower recovery when an external party becomes the source of disruption.",
        fastestFix:
          "Identify critical suppliers, review who has access to what, and document minimum expectations and fallback plans.",
      };
    }

    if (n.includes("operations")) {
      return {
        scenario:
          "Routine controls such as patching, backup monitoring, logging, or change discipline may not be operating as consistently as the business assumes.",
        exposure:
          "This can create hidden weaknesses that only become visible during an outage, incident, or urgent recovery situation.",
        fastestFix:
          "Turn day-to-day controls into tracked routines with owners, cadence, and visible evidence.",
      };
    }

    if (n.includes("risk")) {
      return {
        scenario:
          "Known resilience or security issues may exist informally, but are not being tracked, owned, or reviewed consistently enough to drive action.",
        exposure:
          "This can result in recurring weaknesses, delayed remediation, and limited visibility for leadership when priorities need to be set quickly.",
        fastestFix:
          "Use a simple risk register, assign owners, and review progress regularly rather than relying on informal awareness.",
      };
    }

    if (n.includes("governance")) {
      return {
        scenario:
          "Leadership may support resilience in principle, but accountability, review rhythm, or decision-making structure may not yet be formal enough.",
        exposure:
          "This can lead to drift, unclear priorities, and controls that weaken gradually as the business changes.",
        fastestFix:
          "Set clear ownership, create a simple leadership review cadence, and make follow-up actions visible.",
      };
    }

    if (n.includes("asset") || n.includes("data")) {
      return {
        scenario:
          "Critical systems, sensitive data, or ownership of important business assets may not be defined clearly enough for rapid protection or recovery decisions.",
        exposure:
          "This can lead to confusion during incidents, slower response, weak prioritisation, and avoidable evidence gaps.",
        fastestFix:
          "Identify critical systems and data clearly, assign owners, and make sure the business knows what matters most first.",
      };
    }

    if (n.includes("threat") || n.includes("vulnerability")) {
      return {
        scenario:
          "Exposure may remain open longer than intended because vulnerability identification, prioritisation, or closure is not yet disciplined enough.",
        exposure:
          "This can increase preventable attack surface and allow known weaknesses to remain exploitable for longer than the business expects.",
        fastestFix:
          "Create a regular remediation routine, prioritise higher-risk issues first, and track exceptions visibly.",
      };
    }

    return {
      scenario:
        "This domain may be operating more informally than expected, increasing the chance of inconsistency under pressure.",
      exposure:
        "This can lead to avoidable disruption, weaker evidence, slower response, and higher effort when something goes wrong.",
      fastestFix:
        "Clarify ownership, create a repeatable routine, and keep evidence that the control has actually operated.",
    };
  };

  const intro =
    "Lower-scoring domains do not guarantee failure, but they do indicate where real-world disruption is more likely to originate. This page translates weaker areas into practical business exposure so the report feels relevant beyond scoring alone.";

  for (const line of wrapText(intro, 100)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 14;
  }

  y -= 12;

  const focusDomains = ranked.slice(0, 3);

  for (const d of focusDomains) {
    const name = d.domain_name || d.domain_code || "Domain";
    const score = Number(d.score ?? 0);
    const detail = scenarioForDomain(name);

    const cardHeight = 182;

    if (y - cardHeight < 105) break;

    drawRoundedCard(page, 50, y - cardHeight, 495, cardHeight, {
      fill: BRAND.white,
      border: BRAND.line,
      radius: 18,
    });

    page.drawText(sanitizeText(name), {
      x: 64,
      y: y - 20,
      size: 11,
      font: fontBold,
      color: BRAND.text,
    });

    drawMiniScorePill(
      page,
      448,
      y - 30,
      `${score.toFixed(2)} / 5`,
      fontBold,
      score < 2
        ? rgb(0.99, 0.93, 0.93)
        : score < 3.5
        ? rgb(0.99, 0.97, 0.90)
        : BRAND.accentSoft,
      BRAND.text
    );

    drawBar(page, 64, y - 44, 467, 8, score / 5);

    page.drawText("Likely scenario", {
      x: 64,
      y: y - 64,
      size: 9.5,
      font: fontBold,
      color: BRAND.muted,
    });

    let textY = y - 78;
    for (const line of wrapText(detail.scenario, 84)) {
      page.drawText(line, {
        x: 64,
        y: textY,
        size: 10,
        font,
        color: BRAND.text,
      });
      textY -= 12;
    }

    textY -= 4;
    page.drawText("Business exposure", {
      x: 64,
      y: textY,
      size: 9.5,
      font: fontBold,
      color: BRAND.muted,
    });

    textY -= 14;
    for (const line of wrapText(detail.exposure, 84)) {
      page.drawText(line, {
        x: 64,
        y: textY,
        size: 10,
        font,
        color: BRAND.text,
      });
      textY -= 12;
    }

    textY -= 4;
    page.drawText("Fastest way to reduce this risk", {
      x: 64,
      y: textY,
      size: 9.5,
      font: fontBold,
      color: BRAND.muted,
    });

    textY -= 14;
    for (const line of wrapText(detail.fastestFix, 84)) {
      page.drawText(line, {
        x: 64,
        y: textY,
        size: 10,
        font: fontBold,
        color: BRAND.text,
      });
      textY -= 12;
    }

    y -= cardHeight + 14;
  }

  if (y > 130) {
    page.drawText("Overall interpretation", {
      x: 50,
      y,
      size: 11,
      font: fontBold,
      color: BRAND.text,
    });
    y -= 14;

    const overallLines = [
      "The purpose of this page is not to predict a single event. It is to show where disruption is most likely to begin if current weaknesses remain unchanged.",
      "In most SMEs, better outcomes come from improving ownership, repeatability, and evidence in the weakest areas before investing in complexity elsewhere.",
      "The business does not need every domain to be perfect. It needs the weakest domains to become reliable enough that they no longer create avoidable commercial exposure.",
    ];

    for (const item of overallLines) {
      for (const line of wrapText(item, 100)) {
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
  }

  drawFooter(page, pageNum++, font, reportRef);
}

    /**
 * ------------------------------
 * Premium page 3: Next-level target state and evidence to prioritise
 * ------------------------------
 */
{
  const nextStateForDomain = (name: string) => {
    const n = name.toLowerCase();

    if (n.includes("identity") || n.includes("access")) {
      return {
        targetState:
          "Access is controlled more consistently, MFA is applied where it matters most, and account changes are no longer dependent on memory or informal requests.",
        whyItMatters:
          "This reduces one of the most common breach routes for smaller businesses: account misuse, stale access, and weak protection around email or admin accounts.",
        evidence: [
          "MFA enabled for key accounts",
          "Leavers / joiners / movers checklist with examples",
          "Admin access list with review date",
        ],
      };
    }

    if (n.includes("recovery") || n.includes("resilience")) {
      return {
        targetState:
          "Critical services are identified, recovery priorities are clear, and the business has proof that important systems or data can actually be restored.",
        whyItMatters:
          "This reduces downtime, improves decision-making during disruption, and gives greater confidence that backups are useful rather than assumed.",
        evidence: [
          "Restore test result",
          "Critical services or systems list",
          "Recovery runbook or simple recovery steps",
        ],
      };
    }

    if (n.includes("incident") || n.includes("response")) {
      return {
        targetState:
          "Response roles are clearer, escalation is faster, and the business has practiced what it would do if something important went wrong.",
        whyItMatters:
          "This reduces delay, confusion, and avoidable commercial impact when an issue needs to be contained quickly.",
        evidence: [
          "1-page response plan",
          "Exercise notes or tabletop output",
          "Incident log or lessons learned tracker",
        ],
      };
    }

    if (n.includes("supplier") || n.includes("third-party")) {
      return {
        targetState:
          "Critical suppliers are known, access is controlled, and minimum expectations are clear enough to support due diligence and practical oversight.",
        whyItMatters:
          "This reduces the chance that a supplier becomes a hidden single point of failure for your business.",
        evidence: [
          "Critical supplier list",
          "Supplier security clauses or expectations",
          "Supplier access review or named owner list",
        ],
      };
    }

    if (n.includes("operations")) {
      return {
        targetState:
          "Day-to-day controls such as patching, backups, logging, and change discipline operate as regular routines rather than one-off activity.",
        whyItMatters:
          "This reduces hidden weaknesses and helps the business avoid preventable disruption from routine control failures.",
        evidence: [
          "Patch or maintenance routine evidence",
          "Backup success reports",
          "Logging or monitoring confirmation for key systems",
        ],
      };
    }

    if (n.includes("risk")) {
      return {
        targetState:
          "Top risks are visible, owned, and reviewed regularly enough that they drive action instead of sitting informally in the background.",
        whyItMatters:
          "This helps leadership prioritise properly and reduces the chance that known issues stay open too long.",
        evidence: [
          "Risk register",
          "Action tracker with owners and target dates",
          "Leadership review notes",
        ],
      };
    }

    if (n.includes("governance")) {
      return {
        targetState:
          "Leadership ownership is clear, follow-up happens to a set rhythm, and resilience decisions are easier to explain and evidence.",
        whyItMatters:
          "This reduces drift and makes it easier to keep priorities moving when other business pressures compete for attention.",
        evidence: [
          "Named owner",
          "Review meeting notes",
          "Core policy or decision set",
        ],
      };
    }

    if (n.includes("asset") || n.includes("data")) {
      return {
        targetState:
          "Critical systems and important data can be identified quickly enough to support better protection, faster response, and more confident recovery decisions.",
        whyItMatters:
          "This helps the business focus on what matters most first, instead of losing time during an incident trying to work that out.",
        evidence: [
          "Critical asset register",
          "Data classification labels or guidance",
          "Owner list for key systems or data",
        ],
      };
    }

    if (n.includes("threat") || n.includes("vulnerability")) {
      return {
        targetState:
          "Known weaknesses are found, prioritised, and closed more predictably, with clearer visibility of what is open and why.",
        whyItMatters:
          "This reduces preventable attack surface and lowers the chance that known issues remain exposed for too long.",
        evidence: [
          "Recent scan output",
          "Closure tracking for higher-risk items",
          "Exception or sign-off record",
        ],
      };
    }

    return {
      targetState:
        "The domain operates more consistently, with clearer ownership, a stronger routine, and better proof that the control is actually happening.",
      whyItMatters:
        "This reduces uncertainty and helps the business move from intention to something more reliable and repeatable.",
      evidence: [
        "Named owner",
        "Routine or checklist",
        "Evidence the routine has actually happened",
      ],
    };
  };

  let page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.12);

  const { height } = page.getSize();
  let y = height - 96;

  const startNewPage = () => {
    drawFooter(page, pageNum++, font, reportRef);
    page = addPage(pdfDoc);
    drawBrandHeader(page, shieldImg);
    drawWatermark(page, watermarkImg, 0.12);
    y = height - 96;
  };

  drawSectionTitle(page, "Next-level target state and evidence to prioritise", 50, y, fontBold);
  y -= 28;

  const intro =
    "The aim is not perfection. The aim is to move the weakest domains to the next credible level of maturity. This page shows what a stronger position would look like next, and the evidence that would give real confidence that progress is happening.";

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

  y -= 12;

  const focusDomains = ranked.slice(0, 3);

  for (const d of focusDomains) {
    const name = d.domain_name || d.domain_code || "Domain";
    const score = Number(d.score ?? 0);
    const next = nextStateForDomain(name);

    const targetLines = wrapText(next.targetState, 88);
    const whyLines = wrapText(next.whyItMatters, 88);
    const evidenceLines = next.evidence.flatMap((item) => wrapText(item, 86));

    const cardHeight =
      88 +
      targetLines.length * 12 +
      whyLines.length * 12 +
      evidenceLines.length * 12 +
      28;

    if (y - cardHeight < 95) {
      startNewPage();
    }

    drawRoundedCard(page, 50, y - cardHeight, 495, cardHeight, {
      fill: BRAND.white,
      border: BRAND.line,
      radius: 18,
    });

    page.drawText(sanitizeText(name), {
      x: 64,
      y: y - 18,
      size: 11,
      font: fontBold,
      color: BRAND.text,
    });

    drawMiniScorePill(
      page,
      448,
      y - 28,
      `${score.toFixed(2)} / 5`,
      fontBold,
      score < 2 ? rgb(0.99, 0.93, 0.93) : score < 3.5 ? rgb(0.99, 0.97, 0.90) : BRAND.accentSoft,
      BRAND.text
    );

    drawBar(page, 64, y - 42, 467, 8, score / 5);

    let cy = y - 62;

    page.drawText("What better looks like next", {
      x: 64,
      y: cy,
      size: 9.5,
      font: fontBold,
      color: BRAND.muted,
    });
    cy -= 14;

    for (const line of targetLines) {
      page.drawText(line, {
        x: 64,
        y: cy,
        size: 10,
        font,
        color: BRAND.text,
      });
      cy -= 12;
    }

    cy -= 4;

    page.drawText("Why this matters commercially", {
      x: 64,
      y: cy,
      size: 9.5,
      font: fontBold,
      color: BRAND.muted,
    });
    cy -= 14;

    for (const line of whyLines) {
      page.drawText(line, {
        x: 64,
        y: cy,
        size: 10,
        font,
        color: BRAND.text,
      });
      cy -= 12;
    }

    cy -= 4;

    page.drawText("Evidence to prioritise next", {
      x: 64,
      y: cy,
      size: 9.5,
      font: fontBold,
      color: BRAND.muted,
    });
    cy -= 14;

    for (const item of next.evidence) {
      const wrapped = wrapText(item, 86);
      for (const line of wrapped) {
        page.drawText(line, {
          x: 64,
          y: cy,
          size: 10,
          font,
          color: BRAND.text,
        });
        cy -= 12;
      }
      cy -= 2;
    }

    y -= cardHeight + 14;
  }

  if (y < 170) {
    startNewPage();
  }

  page.drawText("How to use this page", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 14;

  const closing = [
    "Use this section to define what better should look like before starting more work.",
    "The target state helps set direction; the evidence list helps prove whether that direction is becoming real.",
    "For most SMEs, the best improvement path is not more complexity. It is stronger ownership, simpler routines, and clearer proof.",
  ];

  for (const item of closing) {
    for (const line of wrapText(item, 100)) {
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
 * Management actions and ownership
 * ------------------------------
 */
{
  const page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.10);

  const { height } = page.getSize();
  let y = height - 96;

  drawSectionTitle(page, "Management actions and ownership", 50, y, fontBold);
  y -= 28;

  const intro =
    "This page translates the assessment into management actions. The aim is to make ownership clearer, reduce ambiguity, and help leadership turn the report into action rather than discussion alone.";
  for (const line of wrapText(intro, 100)) {
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
  y -= 16;

  const mgmtActions = [
    "Assign a named owner for each of the weakest priority domains.",
    "Set a review point within 30 days to check progress against the plan.",
    "Require evidence for the most important basic controls: access, backups, incident response, and supplier visibility.",
    "Use the Implementation Checklist on the next page as the live working sheet for tracking actions, evidence, and ownership.",
    "Agree which issues need leadership support versus operational follow-through.",
  ];

  for (const item of mgmtActions) {
    for (const line of wrapText(item, 100)) {
      page.drawText(`• ${sanitizeText(line)}`, {
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
  y -= 16;

  const ownerActions = [
    "Complete the highest-priority remediation tasks in the lowest-scoring domains.",
    "Create or update the evidence pack so actions can be demonstrated quickly.",
    "Use the Implementation Checklist to confirm which routines are recurring, who owns them, and what proof is being retained.",
    "Escalate dependencies, blockers, or weak supplier controls early rather than late.",
  ];

  for (const item of ownerActions) {
    for (const line of wrapText(item, 100)) {
      page.drawText(`• ${sanitizeText(line)}`, {
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
  y -= 16;

  const questions = [
    "Which of our weakest domains creates the greatest disruption risk if nothing changes?",
    "What evidence do we have that critical controls are operating consistently today?",
    "Where are we relying on memory, good intent, or key individuals instead of repeatable process?",
    "Which supplier, system, or access weakness would hurt us most if it failed tomorrow?",
  ];

  for (const item of questions) {
    for (const line of wrapText(item, 100)) {
      page.drawText(`• ${sanitizeText(line)}`, {
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
  y -= 16;

  const ownership = [
    "Leadership: sponsor priorities, review progress, approve risk decisions, and challenge delays.",
    "Operational owner: implement actions, maintain evidence, and report progress.",
    "MSP or external support: provide technical execution, monitoring, remediation support, or specialist input where needed.",
  ];

  for (const item of ownership) {
    for (const line of wrapText(item, 100)) {
      page.drawText(`${sanitizeText(line)}`, {
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
  page.drawText(sanitizeText(label), {
    x,
    y: yTop,
    size: 9,
    font: fontBold,
    color: BRAND.muted,
  });

  const boxY = yTop - 24;

  page.drawRectangle({
    x,
    y: boxY,
    width: w,
    height: 18,
    borderWidth: 1,
    borderColor: rgb(0.82, 0.82, 0.82),
    color: rgb(1, 1, 1),
  });

  return boxY - 12;
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
        page.drawText(lines[0] ?? "", {
  	  x: 90,
  	  y,
  	  size: 10,
  	  font,
  	  color: BRAND.text,
	});

	if (lines[1]) {
  page.drawText(lines[1], {
    x: 90,
    y: y - 12,
    size: 10,
    font,
    color: BRAND.text,
  });
}

	page.drawLine({
  	  start: { x: 400, y: y - 2 },
  	  end: { x: width - 50, y: y - 2 },
  	  thickness: 1,
  	  color: rgb(0.88, 0.88, 0.88),
	});

	y -= lines[1] ? 30 : 18;
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
 * MSP / IT Partner Support + Reassessment Recommendation
 * ------------------------------
 */
{
  const page = addPage(pdfDoc);
  drawBrandHeader(page, shieldImg);
  drawWatermark(page, watermarkImg, 0.10);

  const { height } = page.getSize();
  let y = height - 96;

  drawSectionTitle(page, "MSP / IT Partner Support", 50, y, fontBold);
  y -= 28;

  const mspIntro =
    "Many organisations implement resilience improvements with the support of their internal IT team or external IT provider. This report can be used as a practical roadmap for remediation and operational follow-through.";
  for (const line of wrapText(mspIntro, 100)) {
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

  page.drawText("Typical implementation areas", {
    x: 50,
    y,
    size: 11,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 16;

  const mspAreas = [
    "Identity and access management improvements",
    "Backup testing and recovery validation",
    "Vulnerability remediation",
    "System hardening and patch routines",
    "Supplier access review",
  ];

  for (const item of mspAreas) {
    page.drawText(`• ${sanitizeText(item)}`, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 16;
  }

  y -= 6;

  const mspClose =
    "If you work with an IT provider or MSP, this report can be used to structure improvements, agree ownership, and track delivery against the priority actions identified in the assessment.";
  for (const line of wrapText(mspClose, 100)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 14;
  }

  y -= 18;

  drawSectionTitle(page, "Reassessment Recommendation", 50, y, fontBold);
  y -= 28;

  const reassessIntro =
    "Cyber resilience improves over time when controls become routine, measured, and evidence-based. Repeating the assessment helps leadership confirm that maturity is improving rather than drifting.";
  for (const line of wrapText(reassessIntro, 100)) {
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

  page.drawText("Resiliscore recommends reassessment every 6-12 months, or after:", {
    x: 50,
    y,
    size: 10.5,
    font: fontBold,
    color: BRAND.text,
  });
  y -= 18;

  const reassessTriggers = [
    "New systems or cloud migrations",
    "Significant supplier changes",
    "Security incidents",
    "Rapid business growth",
  ];

  for (const item of reassessTriggers) {
    page.drawText(`• ${sanitizeText(item)}`, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 16;
  }

  y -= 8;

  const reassessClose =
    "Tracking progress over time helps leadership, auditors, insurers, customers, and delivery teams understand whether resilience maturity is strengthening in the areas that matter most.";
  for (const line of wrapText(reassessClose, 100)) {
    page.drawText(line, {
      x: 50,
      y,
      size: 10.5,
      font,
      color: BRAND.text,
    });
    y -= 14;
  }

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

    if (!supabase) {
      throw new Error("Supabase client not configured");
    }

    const uploadResult = await supabase.storage
      .from("reports")
      .upload(filePath, pdfBytes, {
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