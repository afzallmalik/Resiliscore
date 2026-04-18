"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DOMAINS_V13 } from "@/lib/domains";

type DomainScoreRaw = {
  code?: string;
  domain_code?: string;
  domainCode?: string;
  name?: string;
  domain_name?: string;
  domainName?: string;
  score?: number;
  risk_score?: number | null;
  breach_route?: string;
  risk_band?: string;
};

type PriorityAction = {
  title?: string;
  why?: string;
  urgency?: string;
};

type FinancialImpact = {
  min?: number | null;
  max?: number | null;
  breakdown?: {
    downtime?: [number, number] | null;
    lostRevenue?: [number, number] | null;
    recovery?: [number, number] | null;
    reputational?: [number, number] | null;
  } | null;
};

type Benchmark = {
  more_secure_than?: number | null;
  less_secure_than?: number | null;
};

type ReportSummary = {
  headline?: string;
  why_it_matters?: string;
};

type ResultsPayload = {
  overall_score?: number;
  overallScore?: number;
  grade?: string;

  domain_scores?: DomainScoreRaw[];
  domainScores?: DomainScoreRaw[];

  interpretation?: string;
  recommendations?: string[];

  email?: string | null;
  company_name?: string | null;
  companyName?: string | null;
  industry?: string | null;

  report_reference?: string | null;
  reportReference?: string | null;

  report_tier?: "free" | "premium";
  reportTier?: "free" | "premium";
  downloadToken?: string | null;

  risk_level?: "High" | "Medium" | "Low" | null;
  top_breach_routes?: string[];
  priority_actions?: PriorityAction[];
  financial_impact?: FinancialImpact | null;
  benchmark?: Benchmark | null;
  report_summary?: ReportSummary | null;
};

type NormalizedDomainScore = {
  code: string;
  name: string;
  fullName: string;
  order: number;
  score: number;
  riskScore: number | null;
  breachRoute: string | null;
};

type NormalizedFinancialImpact = {
  min: number;
  max: number;
  breakdown: {
    downtime: [number, number];
    lostRevenue: [number, number];
    recovery: [number, number];
    reputational: [number, number];
  };
};

function toNum(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function severity(score: number) {
  if (score < 1.5) return "high";
  if (score < 2.5) return "med";
  return "low";
}

function getRiskLevel(overall: number): "High" | "Medium" | "Low" {
  if (overall < 2.25) return "High";
  if (overall < 3.5) return "Medium";
  return "Low";
}

function getRiskSummary(overall: number) {
  const level = getRiskLevel(overall);

  if (level === "High") {
    return "Your business appears exposed to a small number of common weaknesses that attackers often exploit first.";
  }

  if (level === "Medium") {
    return "Some protections appear to be in place, but there are still gaps that could lead to disruption or avoidable cost.";
  }

  return "You appear to have a stronger baseline than many small businesses, but a few gaps could still be exploited if left unchecked.";
}

function getDomainRiskLabel(score: number) {
  if (score < 1.5) return "Urgent";
  if (score < 2.5) return "Needs attention";
  if (score < 3.5) return "Partly covered";
  return "Stronger";
}

function getBreachRoute(fullName: string, shortName: string) {
  const key = `${fullName} ${shortName}`.toLowerCase();

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
  return Array.from(new Set(values.filter(Boolean)));
}

function getTopBreachRoutes(ranked: NormalizedDomainScore[]) {
  return uniqueStrings(
    ranked.slice(0, 3).map((d) => d.breachRoute || getBreachRoute(d.fullName, d.name))
  ).slice(0, 3);
}

function getBusinessSizeBand(companyName: string | null, industry: string | null) {
  if ((industry ?? "").toLowerCase().includes("manufacturing")) return "small_plus";
  if ((industry ?? "").toLowerCase().includes("health")) return "small_plus";
  if ((companyName ?? "").length > 22) return "small_plus";
  return "small";
}

function estimateFinancialImpact(
  overall: number,
  industry: string | null,
  companyName: string | null
): NormalizedFinancialImpact {
  const sizeBand = getBusinessSizeBand(companyName, industry);

  let min = 8000;
  let max = 45000;

  if (sizeBand === "small_plus") {
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

function fmtGBP(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtRange(min: number, max: number) {
  return `${fmtGBP(min)} – ${fmtGBP(max)}`;
}

function getBenchmarkPercent(overall: number) {
  const moreSecureThan = clamp(Math.round(((overall - 0.5) / 4.5) * 100), 5, 95);
  const lessSecureThan = 100 - moreSecureThan;

  return {
    moreSecureThan,
    lessSecureThan,
  };
}

function getPriorityActions(ranked: NormalizedDomainScore[]) {
  const actions: { title: string; why: string }[] = [];

  for (const d of ranked.slice(0, 5)) {
    const key = `${d.fullName} ${d.name}`.toLowerCase();

    if (key.includes("identity") || key.includes("access")) {
      actions.push({
        title: "Enable multi-factor authentication on all email and key business accounts",
        why: "This blocks one of the most common ways small businesses are breached.",
      });
      continue;
    }

    if (key.includes("recovery") || key.includes("backup") || key.includes("resilience")) {
      actions.push({
        title: "Back up your data daily to a separate system and test recovery",
        why: "This reduces downtime and damage if files are lost or encrypted.",
      });
      continue;
    }

    if (key.includes("threat") || key.includes("vulnerability")) {
      actions.push({
        title: "Make sure all business devices and systems update automatically",
        why: "Attackers often exploit known weaknesses that already have fixes available.",
      });
      continue;
    }

    if (key.includes("incident") || key.includes("response")) {
      actions.push({
        title: "Create a simple plan for what to do if something goes wrong",
        why: "Fast, clear action reduces downtime, confusion, and cost.",
      });
      continue;
    }

    if (key.includes("operations")) {
      actions.push({
        title: "Put basic day-to-day security routines in place for devices, users, and data",
        why: "Simple routines prevent small gaps from becoming expensive incidents.",
      });
      continue;
    }

    if (key.includes("supplier") || key.includes("third")) {
      actions.push({
        title: "Review which suppliers can access your systems or data",
        why: "A weak supplier can still create major disruption for your business.",
      });
      continue;
    }

    if (key.includes("asset") || key.includes("data")) {
      actions.push({
        title: "List your key systems and sensitive data so you know what must be protected first",
        why: "You cannot protect or recover what you cannot quickly identify.",
      });
      continue;
    }

    if (key.includes("risk") || key.includes("compliance")) {
      actions.push({
        title: "Track your main security risks and assign an owner to each one",
        why: "Known problems often stay open too long when nobody owns them clearly.",
      });
      continue;
    }

    if (key.includes("governance")) {
      actions.push({
        title: "Assign one person to own cyber risk and review progress monthly",
        why: "Clear ownership is one of the fastest ways to reduce avoidable gaps.",
      });
      continue;
    }

    actions.push({
      title: "Fix the biggest security gap in this area first and assign clear ownership",
      why: "The fastest improvements come from fixing the weakest points before attackers find them.",
    });
  }

  const deduped: { title: string; why: string }[] = [];
  const seen = new Set<string>();

  for (const a of actions) {
    if (seen.has(a.title)) continue;
    seen.add(a.title);
    deduped.push(a);
  }

  while (deduped.length < 5) {
    const filler = [
      {
        title: "Use strong, unique passwords and stop sharing logins",
        why: "Shared and reused passwords make account takeover much easier.",
      },
      {
        title: "Train staff to spot suspicious emails and fake login pages",
        why: "Staff are often the first route attackers use to get in.",
      },
      {
        title: "Remove access quickly when staff leave or change roles",
        why: "Old accounts are an easy weakness if left active too long.",
      },
    ];

    for (const f of filler) {
      if (!seen.has(f.title)) {
        seen.add(f.title);
        deduped.push(f);
      }
      if (deduped.length >= 5) break;
    }
  }

  return deduped.slice(0, 5);
}

function getAssuranceChecklist(domainScores: NormalizedDomainScore[]) {
  const byName = (needle: string) =>
    domainScores.find((d) =>
      `${d.fullName} ${d.name}`.toLowerCase().includes(needle.toLowerCase())
    );

  const access = byName("identity") || byName("access");
  const recovery = byName("recovery") || byName("backup") || byName("resilience");
  const response = byName("incident") || byName("response");
  const operations = byName("operations");
  const suppliers = byName("supplier") || byName("third");

  return [
    {
      label: "Protected access to email and key systems",
      status: (access?.score ?? 0) >= 3 ? "Ready to show" : "Needs work",
    },
    {
      label: "Backups and recovery arrangements",
      status: (recovery?.score ?? 0) >= 3 ? "Ready to show" : "Needs work",
    },
    {
      label: "Basic response plan for incidents",
      status: (response?.score ?? 0) >= 3 ? "Ready to show" : "Needs work",
    },
    {
      label: "Day-to-day security routines",
      status: (operations?.score ?? 0) >= 3 ? "Ready to show" : "Needs work",
    },
    {
      label: "Third-party and supplier controls",
      status: (suppliers?.score ?? 0) >= 3 ? "Ready to show" : "Needs work",
    },
  ];
}

function Icon({
  name,
  size = 18,
}: {
  name:
    | "check"
    | "bolt"
    | "plan"
    | "download"
    | "copy"
    | "risk"
    | "arrow"
    | "money"
    | "shield"
    | "lock";
  size?: number;
}) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true };

  if (name === "check") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M9.5 16.2 5.8 12.5 4.4 13.9l5.1 5.1L20 8.5 18.6 7.1 9.5 16.2Z" />
      </svg>
    );
  }

  if (name === "bolt") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M13 2 3 14h7l-1 8 12-14h-7l-1-6Z" />
      </svg>
    );
  }

  if (name === "plan") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v18l-7-3-7 3V4a2 2 0 0 1 2-2Zm2 6h6V6H9v2Zm0 4h6v-2H9v2Z" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M5 20h14v-2H5v2Zm7-18v10.17l3.59-3.58L17 10l-5 5-5-5 1.41-1.41L11 12.17V2h1Z" />
      </svg>
    );
  }

  if (name === "copy") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"
        />
      </svg>
    );
  }

  if (name === "risk") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
      </svg>
    );
  }

  if (name === "money") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Zm9 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-2.2c-.74 0-1.3-.29-1.74-.79l-1.2.99c.55.67 1.33 1.1 2.24 1.19V15h1.4v-.82c1.35-.19 2.2-1.03 2.2-2.2 0-1.25-.84-1.88-2.32-2.24-1.05-.26-1.33-.44-1.33-.88 0-.37.34-.7.96-.7.66 0 1.12.24 1.56.64l1.08-1.03c-.5-.48-1.1-.81-1.97-.92V6.1h-1.4v.78c-1.19.16-2.03.96-2.03 2.05 0 1.24.82 1.81 2.28 2.18 1.03.25 1.36.48 1.36.96 0 .48-.46.73-1.09.73Z"
        />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M12 2 4 5v6c0 5 3.4 9.4 8 10.9 4.6-1.5 8-5.9 8-10.9V5l-8-3Zm-1 14-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 8.6 11 15.6Z"
        />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-6 0V6a2 2 0 1 1 4 0v2h-4Zm1 8.73V18h2v-1.27a2 2 0 1 0-2 0Z"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path fill="currentColor" d="M12 4 10.59 5.41 16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z" />
    </svg>
  );
}

function RiskCard({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="rr-riskCard">
      <div className="rr-riskCardTitle">{title}</div>
      <div className="rr-riskCardDetail">{detail}</div>
    </div>
  );
}

function ActionCard({
  index,
  title,
  why,
  locked = false,
}: {
  index: number;
  title: string;
  why: string;
  locked?: boolean;
}) {
  return (
    <div className={`rr-actionCard ${locked ? "locked" : ""}`}>
      <div className="rr-actionNo">{locked ? <Icon name="lock" size={16} /> : index}</div>
      <div>
        <div className="rr-actionTitle">{title}</div>
        <div className="rr-actionWhy">{why}</div>
      </div>
    </div>
  );
}

function AssuranceItem({
  label,
  status,
  locked = false,
}: {
  label: string;
  status: string;
  locked?: boolean;
}) {
  const ready = status === "Ready to show";

  return (
    <div className={`rr-assuranceItem ${ready ? "ready" : "needs"} ${locked ? "locked" : ""}`}>
      <div className="rr-assuranceLabel">
        {locked ? (
          <>
            <Icon name="lock" size={14} /> {label}
          </>
        ) : (
          label
        )}
      </div>
      <div className="rr-assuranceStatus">{locked ? "Full report" : status}</div>
    </div>
  );
}

function DomainCard({
  name,
  score,
}: {
  name: string;
  score: number;
}) {
  const sev = severity(score);
  const pct = `${(score / 5) * 100}%`;

  return (
    <div className="rs-domainCard">
      <div className="rs-domainTop">
        <div>
          <div className="rs-domainName">{name}</div>
          <div className="rs-domainLabel">{getDomainRiskLabel(score)}</div>
        </div>
        <div className={`rs-domainBadge ${sev}`}>{score.toFixed(2)}</div>
      </div>

      <div className="rs-domainTrack">
        <div className={`rs-domainFill ${sev}`} style={{ width: pct }} />
      </div>
    </div>
  );
}

function LockedPanel({
  title,
  text,
  bullets,
  onUnlock,
}: {
  title: string;
  text: string;
  bullets: string[];
  onUnlock: () => void;
}) {
  return (
    <div className="rs-panel rs-upsell">
      <div className="rs-upsellKicker">Full report available</div>
      <div className="rs-upsellTitle">{title}</div>
      <div className="rs-upsellText">{text}</div>

      <div className="rs-featureList">
        {bullets.map((item) => (
          <div key={item} className="rs-featureItem">
            <Icon name="check" />
            {item}
          </div>
        ))}
      </div>

      <div className="rs-upsellActions">
        <button className="rs-btn rs-btnPrimary" type="button" onClick={onUnlock}>
          <Icon name="bolt" />
          Unlock full report — £99
        </button>
      </div>

      <div className="rs-upsellFoot">
        One-time payment. No subscription. Use it before spending thousands on an audit or consultancy.
      </div>
    </div>
  );
}

export default function ResultsClient({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "1";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/assessments/${id}/results`, { cache: "no-store" });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Could not load results (HTTP ${res.status}) ${t}`);
    }

    const json = (await res.json()) as ResultsPayload;
    setData(json);
    return json;
  }, [id]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);
        await load();
      } catch (e: any) {
        if (!active) return;
        setErr(e?.message ?? "Could not load results.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => {
    async function confirmUpgradeIfNeeded() {
      const url = new URL(window.location.href);
      const upgradedFlag = url.searchParams.get("upgraded");

      if (upgradedFlag !== "1") return;

      try {
        await fetch(`/api/assessments/${id}/confirm-upgrade`, {
          method: "POST",
          cache: "no-store",
        });
      } catch (e) {
        console.error("Confirm upgrade failed", e);
      }

      await load();
    }

    confirmUpgradeIfNeeded();
  }, [id, load]);

  useEffect(() => {
    if (!upgraded) return;

    let cancelled = false;

    (async () => {
      try {
        setNotice("Payment received. Confirming your premium access…");

        try {
          await fetch(`/api/assessments/${id}/confirm-upgrade`, {
            method: "POST",
            cache: "no-store",
          });
        } catch {}

        if (cancelled) return;

        const first = await load();
        const firstTier = (first?.report_tier ?? first?.reportTier ?? "free") as "free" | "premium";

        if (firstTier === "premium") {
          setNotice("Premium report unlocked ✅");
          return;
        }

        setNotice("Payment received. Unlocking your premium report…");

        const delays = [800, 1400, 2200, 3200];

        for (const d of delays) {
          await new Promise((r) => setTimeout(r, d));
          if (cancelled) return;

          try {
            await fetch(`/api/assessments/${id}/confirm-upgrade`, {
              method: "POST",
              cache: "no-store",
            });
          } catch {}

          try {
            const latest = await load();
            const tier = (latest?.report_tier ?? latest?.reportTier ?? "free") as "free" | "premium";
            if (tier === "premium") {
              setNotice("Premium report unlocked ✅");
              return;
            }
          } catch {}
        }

        setNotice("If your report is still locked, refresh once — payment may still be confirming.");
      } catch {
        setNotice("If your report is still locked, refresh once — payment may still be confirming.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [upgraded, id, load]);

  const normalized = useMemo(() => {
    const overall = toNum(data?.overall_score ?? data?.overallScore ?? 0, 0);
    const raw = (data?.domain_scores ?? data?.domainScores ?? []) as DomainScoreRaw[];

    const scoreByKey = new Map<
      string,
      { score: number; riskScore: number | null; breachRoute: string | null }
    >();

    for (const d of raw) {
      const key = String(
        d.name ??
          d.domain_name ??
          d.domainName ??
          d.code ??
          d.domain_code ??
          d.domainCode ??
          ""
      ).trim();

      if (!key) continue;

      scoreByKey.set(key, {
        score: clamp(toNum(d.score, 0), 0, 5),
        riskScore: d.risk_score == null ? null : toNum(d.risk_score, 0),
        breachRoute: d.breach_route ? String(d.breach_route) : null,
      });
    }

    const domainScores: NormalizedDomainScore[] = DOMAINS_V13.map((def) => {
      const byFull = scoreByKey.get(def.code);
      const byShort = scoreByKey.get(def.short);
      const resolved = byFull ?? byShort ?? { score: 0, riskScore: null, breachRoute: null };

      return {
        code: def.code,
        name: def.short,
        fullName: def.code,
        order: def.order,
        score: Number(resolved.score.toFixed(2)),
        riskScore: resolved.riskScore,
        breachRoute: resolved.breachRoute,
      };
    });

    const ranked = [...domainScores].sort((a, b) => a.score - b.score);
    const tier = (data?.report_tier ?? data?.reportTier ?? "free") as "free" | "premium";

    const riskLevel = data?.risk_level ?? getRiskLevel(overall);

    const riskSummary =
      data?.report_summary?.headline?.trim() || getRiskSummary(overall);

    const topBreachRoutes =
      Array.isArray(data?.top_breach_routes) && data.top_breach_routes.length
        ? uniqueStrings(data.top_breach_routes)
        : getTopBreachRoutes(ranked);

    let impact: NormalizedFinancialImpact;

    if (data?.financial_impact?.min != null && data?.financial_impact?.max != null) {
      impact = {
        min: toNum(data.financial_impact.min, 0),
        max: toNum(data.financial_impact.max, 0),
        breakdown: {
          downtime: data.financial_impact.breakdown?.downtime ?? [0, 0],
          lostRevenue: data.financial_impact.breakdown?.lostRevenue ?? [0, 0],
          recovery: data.financial_impact.breakdown?.recovery ?? [0, 0],
          reputational: data.financial_impact.breakdown?.reputational ?? [0, 0],
        },
      };
    } else {
      impact = estimateFinancialImpact(
        overall,
        data?.industry ?? null,
        data?.company_name ?? data?.companyName ?? null
      );
    }

    const benchmark =
      data?.benchmark?.less_secure_than != null
        ? {
            moreSecureThan: toNum(data?.benchmark?.more_secure_than, 0),
            lessSecureThan: toNum(data?.benchmark?.less_secure_than, 0),
          }
        : getBenchmarkPercent(overall);

    const actions =
      Array.isArray(data?.priority_actions) && data.priority_actions.length
        ? data.priority_actions
            .map((a) => ({
              title: String(a?.title ?? "").trim(),
              why: String(a?.why ?? "").trim(),
            }))
            .filter((a) => a.title && a.why)
            .slice(0, 5)
        : getPriorityActions(ranked);

    const assurance = getAssuranceChecklist(domainScores);

    return {
      overall: Number(overall.toFixed(2)),
      domainScores,
      ranked,
      email: data?.email ?? null,
      companyName: data?.company_name ?? data?.companyName ?? null,
      industry: data?.industry ?? null,
      reportReference: data?.report_reference ?? data?.reportReference ?? null,
      reportTier: tier,
      downloadToken: data?.downloadToken ?? null,
      riskLevel,
      riskSummary,
      whyItMatters:
        data?.report_summary?.why_it_matters?.trim() ||
        data?.interpretation ||
        "Attackers usually look for simple weaknesses first. Your report highlights where those gaps are most likely to exist and what to fix quickly.",
      topBreachRoutes,
      impact,
      benchmark,
      actions,
      assurance,
    };
  }, [data]);

  async function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied.");
    } catch {
      alert("Could not copy link.");
    }
  }

  function goCheckout() {
    window.location.href = `/api/checkout?assessmentId=${encodeURIComponent(id)}`;
  }

  if (loading) {
    return (
      <main>
        <div className="rs-loadingWrap">
          <div className="rs-loadingCard">
            <div className="rs-loadingText">Loading your risk report…</div>
          </div>
        </div>
      </main>
    );
  }

  if (err || !data) {
    return (
      <main>
        <div className="rs-loadingWrap">
          <div className="rs-loadingCard">
            <h2 style={{ marginTop: 0 }}>Risk report</h2>
            <p className="rs-muted rs-mutedDark">{err ?? "Result not found."}</p>
            <Link className="rs-btn rs-btnPrimary" href="/assessment">
              Start a new assessment
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const {
    overall,
    ranked,
    email,
    companyName,
    industry,
    reportReference,
    reportTier,
    downloadToken,
    riskLevel,
    riskSummary,
    whyItMatters,
    topBreachRoutes,
    impact,
    benchmark,
    actions,
    assurance,
  } = normalized;

  const isPremium = reportTier === "premium";
  const freeRoutes = topBreachRoutes.slice(0, 2);
  const weakestDomains = ranked.slice(0, 3);
  const previewActions = actions.slice(0, 2);

  return (
    <main>
      <div className="rs-shell">
        <section className="rs-hero">
          <div className="rs-heroCopy">
            <div className="rs-kicker">
              <Icon name="shield" />
              Resiliscore Risk Report
            </div>

            <h1>See where cyber disruption is most likely to start in your business.</h1>

            <p className="rs-heroLead">
              {riskSummary}
            </p>

            <div className="rs-metaRow">
              {email ? (
                <div className="rs-pill">
                  Email <span>{email}</span>
                </div>
              ) : null}
              {companyName ? (
                <div className="rs-pill">
                  Business <span>{companyName}</span>
                </div>
              ) : null}
              {industry ? (
                <div className="rs-pill">
                  Industry <span>{industry}</span>
                </div>
              ) : null}
              {reportReference ? (
                <div className="rs-pill">
                  Ref <span>{reportReference}</span>
                </div>
              ) : null}
              <div className="rs-pill">
                Report <span>{isPremium ? "Premium" : "Free preview"}</span>
              </div>
            </div>

            {notice ? <div className="rs-notice">{notice}</div> : null}

            <div className="rs-actions">
              {isPremium ? (
                <a
                  className="rs-btn rs-btnPrimary"
                  href={`/api/assessments/${id}/pdf?token=${encodeURIComponent(downloadToken ?? "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="download" />
                  Download full report
                </a>
              ) : (
                <button className="rs-btn rs-btnPrimary" type="button" onClick={goCheckout}>
                  <Icon name="bolt" />
                  Unlock full report — £99
                </button>
              )}

              <button className="rs-btn rs-btnSecondary" type="button" onClick={copyLink}>
                <Icon name="copy" />
                Copy link
              </button>

              <Link className="rs-btn rs-btnTertiary" href="/assessment">
                New assessment
              </Link>
            </div>
          </div>

          <div className="rr-heroCard">
            <div className={`rr-riskBadge ${riskLevel.toLowerCase()}`}>{riskLevel} risk</div>

            <div className="rr-impactLabel">Indicative business impact</div>
            <div className="rr-impactValue">{fmtRange(impact.min, impact.max)}</div>

            <div className="rr-impactNote">
              This is an indicative range based on your current answers and the areas most likely to create disruption first.
            </div>

            <div className="rr-breachList">
              {freeRoutes.map((route) => (
                <div key={route} className="rr-breachItem">
                  <Icon name="risk" size={16} />
                  <span>{route}</span>
                </div>
              ))}
            </div>

            {!isPremium ? (
              <div className="rr-heroLockNote">
                The full report includes the complete breach route view, fuller cost breakdown, and a practical action plan.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rs-kpiGrid">
          <div className="rs-kpiCard">
            <div className="rs-kpiLabel">Current risk level</div>
            <div className="rs-kpiValue rs-kpiValueSmall">{riskLevel}</div>
            <div className="rs-kpiSub">Based on your answers today</div>
          </div>

          <div className="rs-kpiCard">
            <div className="rs-kpiLabel">Indicative security position</div>
            <div className="rs-kpiValue">{overall.toFixed(1)}</div>
            <div className="rs-kpiSub">Higher score = stronger protection</div>
          </div>

          <div className="rs-kpiCard rs-kpiWide">
            <div className="rs-kpiLabel">Why this matters</div>
            <div className="rs-kpiText">{whyItMatters}</div>
          </div>
        </section>

        <section className="rr-sectionGrid">
          <div className="rs-panel rs-panelLight">
            <div className="rr-sectionHead">
              <div className="rr-sectionTitle">1. Your most likely breach routes</div>
              <div className="rr-sectionSub">
                These are the areas most likely to create disruption if left unchanged.
              </div>
            </div>

            <div className="rr-riskGrid">
              {freeRoutes.map((route, i) => (
                <RiskCard
                  key={route}
                  title={route}
                  detail={
                    i === 0
                      ? "This appears to be the highest-priority exposure visible in your current answers."
                      : "This is another common route small businesses are breached when weaknesses remain unresolved."
                  }
                />
              ))}
            </div>

            {!isPremium ? (
              <div className="rr-miniLocked">
                <Icon name="lock" size={14} />
                Full report unlocks the complete route analysis and wider context.
              </div>
            ) : null}
          </div>

          <div className="rs-panel rs-panelLight">
            <div className="rr-sectionHead">
              <div className="rr-sectionTitle">2. What this could cost</div>
              <div className="rr-sectionSub">
                Indicative business impact based on your current resilience position.
              </div>
            </div>

            <div className="rr-moneyCard">
              <div className="rr-moneyTop">
                <div className="rr-moneyIcon">
                  <Icon name="money" size={20} />
                </div>
                <div>
                  <div className="rr-moneyLabel">Estimated financial exposure</div>
                  <div className="rr-moneyValue">{fmtRange(impact.min, impact.max)}</div>
                </div>
              </div>

              <div className="rr-costRows">
                <div className="rr-costRow">
                  <span>Downtime</span>
                  <strong>{fmtRange(impact.breakdown.downtime[0], impact.breakdown.downtime[1])}</strong>
                </div>
                <div className="rr-costRow">
                  <span>Lost revenue</span>
                  <strong>{fmtRange(impact.breakdown.lostRevenue[0], impact.breakdown.lostRevenue[1])}</strong>
                </div>
                {isPremium ? (
                  <>
                    <div className="rr-costRow">
                      <span>Recovery costs</span>
                      <strong>{fmtRange(impact.breakdown.recovery[0], impact.breakdown.recovery[1])}</strong>
                    </div>
                    <div className="rr-costRow">
                      <span>Reputational impact</span>
                      <strong>{fmtRange(impact.breakdown.reputational[0], impact.breakdown.reputational[1])}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rr-costRow rr-costRowLocked">
                      <span>
                        <Icon name="lock" size={14} /> Recovery costs
                      </span>
                      <strong>Full report</strong>
                    </div>
                    <div className="rr-costRow rr-costRowLocked">
                      <span>
                        <Icon name="lock" size={14} /> Reputational impact
                      </span>
                      <strong>Full report</strong>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rs-mainGrid">
          <div className="rs-column">
            <div className="rs-panel rs-panelLight">
              <div className="rr-sectionHead">
                <div className="rr-sectionTitle">
                  {isPremium ? "3. What to fix first" : "3. Initial actions you can take"}
                </div>
                <div className="rr-sectionSub">
                  {isPremium
                    ? "A practical action plan based on your current results."
                    : "A small preview of the practical action plan included in the full report."}
                </div>
              </div>

              <div className="rr-actionStack">
                {previewActions.map((action, i) => (
                  <ActionCard
                    key={action.title}
                    index={i + 1}
                    title={action.title}
                    why={action.why}
                  />
                ))}

                {!isPremium &&
                  actions.slice(2, 5).map((action, i) => (
                    <ActionCard
                      key={action.title}
                      index={i + 3}
                      title="Detailed action locked in full report"
                      why="Unlock the full report to see the remaining priority actions, sequencing, and practical rationale."
                      locked
                    />
                  ))}
              </div>
            </div>

            {!isPremium ? (
              <LockedPanel
                title="Get the full business risk report before spending thousands on an audit."
                text="This report is designed to give you clarity first — so you can see where disruption is most likely to start, what it could cost, and whether you need a deeper audit or specialist support."
                bullets={[
                  "Full downloadable PDF report",
                  "Complete 90-day action plan",
                  "Full assurance and evidence checklist",
                  "Complete benchmark context",
                  "Useful before insurers, clients, or consultants ask questions",
                ]}
                onUnlock={goCheckout}
              />
            ) : null}
          </div>

          <div className="rs-column">
            <div className="rs-panel rs-panelLight">
              <div className="rr-sectionHead">
                <div className="rr-sectionTitle">4. Risk areas by topic</div>
                <div className="rr-sectionSub">
                  These are the weakest areas visible in your current answers.
                </div>
              </div>

              <div className="rs-domainGrid">
                {(isPremium ? ranked : weakestDomains).map((d) => (
                  <DomainCard key={d.code} name={d.name} score={d.score} />
                ))}
              </div>

              {!isPremium ? (
                <div className="rr-miniLocked">
                  <Icon name="lock" size={14} />
                  Full report includes the complete domain view and broader context.
                </div>
              ) : null}
            </div>

            <div className="rs-panel rs-panelLight">
              <div className="rr-sectionHead">
                <div className="rr-sectionTitle">5. Benchmark view</div>
                <div className="rr-sectionSub">
                  A simple comparison point to help interpret your current result.
                </div>
              </div>

              <div className="rr-benchmarkWrap">
                <div className="rr-benchmarkValue">
                  {isPremium ? (
                    <>
                      You are less secure than <strong>{benchmark.lessSecureThan}%</strong> of similar businesses
                    </>
                  ) : (
                    <>
                      Your current result suggests the business is <strong>below the typical SME baseline</strong> in some important resilience areas.
                    </>
                  )}
                </div>

                <div className="rr-benchmarkTrack">
                  <div
                    className="rr-benchmarkFill"
                    style={{ width: `${benchmark.lessSecureThan}%` }}
                  />
                </div>

                <div className="rr-benchmarkScale">
                  <span>Lower risk</span>
                  <span>Higher risk</span>
                </div>
              </div>

              {!isPremium ? (
                <div className="rr-miniLocked">
                  <Icon name="lock" size={14} />
                  Full report includes fuller benchmark wording and interpretation.
                </div>
              ) : null}
            </div>

            <div className="rs-panel rs-panelLight">
              <div className="rr-sectionHead">
                <div className="rr-sectionTitle">6. What you can show others</div>
                <div className="rr-sectionSub">
                  Useful before conversations with insurers, clients, partners, or consultants.
                </div>
              </div>

              <div className="rr-assuranceStack">
                {(isPremium ? assurance : assurance.slice(0, 2)).map((item) => (
                  <AssuranceItem
                    key={item.label}
                    label={item.label}
                    status={item.status}
                  />
                ))}

                {!isPremium &&
                  assurance.slice(2).map((item) => (
                    <AssuranceItem
                      key={item.label}
                      label={item.label}
                      status={item.status}
                      locked
                    />
                  ))}
              </div>
            </div>

            <div className="rs-panel rs-panelLight">
              {isPremium ? (
                <>
                  <div className="rs-deliverablesTitle">Your full report is ready</div>
                  <div className="rs-deliverablesText">
                    Download the full branded report as a PDF.
                  </div>
                  <div className="rs-deliverablesActions">
                    <a
                      className="rs-btn rs-btnPrimary"
                      href={`/api/assessments/${id}/pdf?token=${encodeURIComponent(downloadToken ?? "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Icon name="download" />
                      Download full report
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="rs-deliverablesTitle">Your free preview is ready</div>
                  <div className="rs-deliverablesText">
                    Unlock the full report for a complete breakdown, fuller actions, benchmark context, and a downloadable PDF you can actually use.
                  </div>
                  <div className="rs-deliverablesActions">
                    <button className="rs-btn rs-btnPrimary" type="button" onClick={goCheckout}>
                      <Icon name="bolt" />
                      Unlock full report — £99
                    </button>
                  </div>
                  <div className="rs-deliverablesFoot">
                    One-time payment. No subscription. Built as a practical step before larger cyber spend.
                  </div>
                </>
              )}
            </div>

            <div className="rs-support">
              For support or help understanding your report, contact <strong>hello@resiliscore.co.uk</strong>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .rs-shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 20px 16px 42px;
          display: grid;
          gap: 18px;
        }

        .rs-muted {
          color: rgba(255,255,255,0.68);
        }

        .rs-mutedDark {
          color: rgba(6,27,34,0.72);
        }

        .rs-loadingWrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 20px 16px 42px;
        }

        .rs-loadingCard {
          border-radius: 22px;
          padding: 26px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .rs-loadingText {
          color: #061b22;
          font-weight: 700;
        }

        .rs-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 44px;
          padding: 0 15px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 800;
          border: 1px solid transparent;
          cursor: pointer;
          transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
        }

        .rs-btn:hover {
          transform: translateY(-1px);
        }

        .rs-btnPrimary {
          background: #0db17b;
          color: #fff;
          border-color: rgba(13, 177, 123, 0.15);
          box-shadow: 0 8px 20px rgba(13, 177, 123, 0.22);
        }

        .rs-btnPrimary:hover {
          background: #0a8d62;
        }

        .rs-btnSecondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.94);
          border-color: rgba(255,255,255,0.14);
        }

        .rs-btnSecondary:hover {
          background: rgba(255,255,255,0.10);
        }

        .rs-btnTertiary {
          background: transparent;
          color: rgba(255,255,255,0.94);
          border-color: rgba(255,255,255,0.14);
        }

        .rs-btnTertiary:hover {
          background: rgba(255,255,255,0.06);
        }

        .rs-hero {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            radial-gradient(600px 320px at 0% 0%, rgba(13,177,123,0.18), transparent 60%),
            radial-gradient(700px 340px at 100% 0%, rgba(255,255,255,0.07), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 18px;
          align-items: stretch;
        }

        .rs-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.92);
          font-size: 13px;
          font-weight: 800;
        }

        .rs-hero h1 {
          margin: 16px 0 0;
          color: rgba(255,255,255,0.96);
          font-size: 42px;
          line-height: 1.05;
          letter-spacing: -0.03em;
          max-width: 14ch;
        }

        .rs-heroLead {
          margin: 14px 0 0;
          color: rgba(255,255,255,0.76);
          line-height: 1.7;
          max-width: 62ch;
        }

        .rs-metaRow {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rs-pill {
          border-radius: 999px;
          padding: 7px 11px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.68);
          font-size: 13px;
        }

        .rs-pill span {
          color: rgba(255,255,255,0.95);
          font-weight: 700;
          margin-left: 6px;
        }

        .rs-notice {
          margin-top: 14px;
          border-radius: 14px;
          padding: 10px 12px;
          background: rgba(13,177,123,0.12);
          border: 1px solid rgba(13,177,123,0.22);
          color: rgba(255,255,255,0.92);
          font-weight: 700;
        }

        .rs-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rr-heroCard {
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 12px 30px rgba(3,16,22,0.10);
          padding: 20px;
          display: grid;
          align-content: start;
          gap: 14px;
        }

        .rr-riskBadge {
          width: fit-content;
          min-height: 34px;
          padding: 0 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          font-weight: 900;
          font-size: 14px;
        }

        .rr-riskBadge.high {
          background: rgba(255,107,107,0.12);
          color: #c94a4a;
          border: 1px solid rgba(255,107,107,0.22);
        }

        .rr-riskBadge.medium {
          background: rgba(255,193,7,0.12);
          color: #a97100;
          border: 1px solid rgba(255,193,7,0.22);
        }

        .rr-riskBadge.low {
          background: rgba(13,177,123,0.12);
          color: #0a8d62;
          border: 1px solid rgba(13,177,123,0.22);
        }

        .rr-impactLabel {
          color: rgba(6,27,34,0.60);
          font-size: 13px;
          font-weight: 700;
        }

        .rr-impactValue {
          color: #061b22;
          font-size: 34px;
          line-height: 1.05;
          font-weight: 900;
        }

        .rr-impactNote {
          color: rgba(6,27,34,0.72);
          line-height: 1.6;
        }

        .rr-breachList {
          display: grid;
          gap: 10px;
          margin-top: 4px;
        }

        .rr-breachItem {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(6,27,34,0.08);
          border-radius: 14px;
          padding: 11px 12px;
          background: #fafcfc;
          color: #061b22;
        }

        .rr-heroLockNote,
        .rr-miniLocked {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
          color: rgba(6,27,34,0.64);
          font-size: 13px;
          font-weight: 600;
        }

        .rs-kpiGrid {
          display: grid;
          grid-template-columns: 1fr 1fr 1.6fr;
          gap: 16px;
        }

        .rs-kpiCard {
          border-radius: 22px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 10px 28px rgba(3,16,22,0.08);
        }

        .rs-kpiLabel {
          color: rgba(6,27,34,0.60);
          font-size: 13px;
          font-weight: 700;
        }

        .rs-kpiValue {
          margin-top: 8px;
          color: #061b22;
          font-size: 38px;
          line-height: 1;
          font-weight: 900;
        }

        .rs-kpiValueSmall {
          font-size: 28px;
          line-height: 1.1;
        }

        .rs-kpiSub {
          margin-top: 8px;
          color: rgba(6,27,34,0.65);
        }

        .rs-kpiText {
          margin-top: 10px;
          color: rgba(6,27,34,0.78);
          line-height: 1.65;
        }

        .rr-sectionGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .rs-mainGrid {
          display: grid;
          grid-template-columns: 0.98fr 1.02fr;
          gap: 18px;
          align-items: start;
        }

        .rs-column {
          display: grid;
          gap: 18px;
        }

        .rs-panel {
          border-radius: 22px;
          padding: 18px;
        }

        .rs-panelLight {
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 10px 28px rgba(3,16,22,0.08);
        }

        .rs-panelDark {
          background:
            radial-gradient(500px 220px at 0% 0%, rgba(13,177,123,0.12), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.10);
        }

        .rs-panelHead {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }

        .rs-panelTitle {
          color: #061b22;
          font-size: 18px;
          font-weight: 850;
        }

        .rs-panelTitleLight {
          color: rgba(255,255,255,0.95);
        }

        .rs-panelSub {
  margin-top: 6px;
  line-height: 1.6;
}

.rs-panelDark .rs-panelSub {
  color: rgba(255,255,255,0.66);
}

.rs-panelLight .rs-panelSub {
  color: rgba(6,27,34,0.68);
}

.rs-panelLight .rs-domainName {
  color: #061b22;
}

.rs-panelLight .rs-domainLabel {
  color: rgba(6,27,34,0.62);
}

.rs-panelLight .rs-domainCard {
  background: #fbfcfd;
  border: 1px solid rgba(6,27,34,0.08);
}

.rs-panelLight .rs-domainTrack {
  background: #edf2f4;
  border: 1px solid rgba(6,27,34,0.08);
}

        .rr-sectionHead {
          display: grid;
          gap: 6px;
        }

        .rr-sectionTitle {
          color: #061b22;
          font-size: 18px;
          font-weight: 850;
        }

        .rr-sectionSub {
          color: rgba(6,27,34,0.68);
          line-height: 1.6;
        }

        .rr-riskGrid {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .rr-riskCard {
          border: 1px solid rgba(6,27,34,0.08);
          border-radius: 18px;
          background: #fbfcfd;
          padding: 16px;
        }

        .rr-riskCardTitle {
          color: #061b22;
          font-weight: 850;
          font-size: 17px;
        }

        .rr-riskCardDetail {
          margin-top: 8px;
          color: rgba(6,27,34,0.74);
          line-height: 1.6;
        }

        .rr-moneyCard {
          margin-top: 14px;
          border-radius: 18px;
          border: 1px solid rgba(6,27,34,0.08);
          background: linear-gradient(180deg, #ffffff, #fbfcfd);
          padding: 18px;
        }

        .rr-moneyTop {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .rr-moneyIcon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(13,177,123,0.10);
          color: #0a8d62;
        }

        .rr-moneyLabel {
          color: rgba(6,27,34,0.60);
          font-size: 13px;
          font-weight: 700;
        }

        .rr-moneyValue {
          margin-top: 4px;
          color: #061b22;
          font-size: 32px;
          line-height: 1.05;
          font-weight: 900;
        }

        .rr-costRows {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .rr-costRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(6,27,34,0.06);
          color: rgba(6,27,34,0.82);
        }

        .rr-costRow span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .rr-costRow:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .rr-costRowLocked {
          color: rgba(6,27,34,0.54);
        }

        .rr-actionStack {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .rr-actionCard {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 14px;
          border-radius: 18px;
          padding: 16px;
          background: #fbfcfd;
          border: 1px solid rgba(6,27,34,0.08);
        }

        .rr-actionCard.locked {
          background: #f7f8fa;
          border-style: dashed;
        }

        .rr-actionNo {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(13,177,123,0.12);
          color: #0a8d62;
          font-weight: 900;
        }

        .rr-actionTitle {
          color: #061b22;
          font-weight: 850;
          line-height: 1.4;
        }

        .rr-actionWhy {
          margin-top: 6px;
          color: rgba(6,27,34,0.72);
          line-height: 1.6;
        }

        .rs-domainGrid {
          margin-top: 16px;
          display: grid;
          gap: 12px;
        }

        .rs-domainCard {
          border-radius: 18px;
          padding: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .rs-domainTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }

        .rs-domainName {
          color: rgba(255,255,255,0.95);
          font-weight: 800;
        }

        .rs-domainLabel {
          margin-top: 4px;
          color: rgba(255,255,255,0.62);
          font-size: 13px;
        }

        .rs-domainBadge {
          min-width: 54px;
          height: 34px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          padding: 0 12px;
        }

        .rs-domainBadge.low {
          background: rgba(13,177,123,0.16);
          color: #8df0cb;
          border: 1px solid rgba(13,177,123,0.24);
        }

        .rs-domainBadge.med {
          background: rgba(255,193,7,0.16);
          color: #ffd67a;
          border: 1px solid rgba(255,193,7,0.22);
        }

        .rs-domainBadge.high {
          background: rgba(255,107,107,0.16);
          color: #ff9c9c;
          border: 1px solid rgba(255,107,107,0.22);
        }

        .rs-domainTrack {
          margin-top: 12px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.08);
          overflow: hidden;
        }

        .rs-domainFill {
          height: 100%;
          border-radius: 999px;
        }

        .rs-domainFill.low {
          background: rgba(13,177,123,0.85);
        }

        .rs-domainFill.med {
          background: rgba(255,193,7,0.82);
        }

        .rs-domainFill.high {
          background: rgba(255,107,107,0.82);
        }

        .rr-benchmarkWrap {
          margin-top: 14px;
          display: grid;
          gap: 12px;
        }

        .rr-benchmarkValue {
          color: #061b22;
          line-height: 1.6;
          font-size: 17px;
        }

        .rr-benchmarkValue strong {
          font-weight: 900;
        }

        .rr-benchmarkTrack {
          height: 14px;
          border-radius: 999px;
          background: #edf2f4;
          border: 1px solid rgba(6,27,34,0.08);
          overflow: hidden;
        }

        .rr-benchmarkFill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0db17b, #f0b323, #ff6b6b);
        }

        .rr-benchmarkScale {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: rgba(6,27,34,0.60);
          font-size: 13px;
          font-weight: 700;
        }

        .rr-assuranceStack {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .rr-assuranceItem {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          border-radius: 14px;
          padding: 12px 14px;
          border: 1px solid rgba(6,27,34,0.08);
          background: #fbfcfd;
        }

        .rr-assuranceItem.ready {
          border-color: rgba(13,177,123,0.20);
          background: rgba(13,177,123,0.06);
        }

        .rr-assuranceItem.needs {
          border-color: rgba(255,193,7,0.22);
          background: rgba(255,193,7,0.08);
        }

        .rr-assuranceItem.locked {
          background: #f7f8fa;
          border-style: dashed;
        }

        .rr-assuranceLabel {
          color: #061b22;
          font-weight: 700;
          line-height: 1.5;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .rr-assuranceStatus {
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
          color: #061b22;
        }

        .rs-upsell {
          background:
            radial-gradient(420px 220px at 0% 0%, rgba(13,177,123,0.16), transparent 70%),
            linear-gradient(180deg, #0a2530, #0c2b36);
          border: 1px solid rgba(13,177,123,0.20);
        }

        .rs-upsellKicker {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.62);
          font-weight: 800;
        }

        .rs-upsellTitle {
          margin-top: 8px;
          color: rgba(255,255,255,0.96);
          font-size: 24px;
          line-height: 1.15;
          font-weight: 900;
        }

        .rs-upsellText {
          margin-top: 10px;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
        }

        .rs-featureList {
          margin-top: 16px;
          display: grid;
          gap: 10px;
        }

        .rs-featureItem {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: rgba(255,255,255,0.90);
          line-height: 1.5;
        }

        .rs-upsellActions {
          margin-top: 18px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rs-upsellFoot {
          margin-top: 12px;
          color: rgba(255,255,255,0.62);
          font-size: 13px;
          line-height: 1.6;
        }

        .rs-deliverablesTitle {
          color: #061b22;
          font-weight: 850;
          font-size: 18px;
        }

        .rs-deliverablesText {
          margin-top: 8px;
          color: rgba(6,27,34,0.72);
          line-height: 1.65;
        }

        .rs-deliverablesActions {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .rs-deliverablesFoot {
          margin-top: 10px;
          color: rgba(6,27,34,0.60);
          font-size: 13px;
          line-height: 1.6;
        }

        .rs-support {
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          padding: 0 4px;
        }

        @media (max-width: 1080px) {
          .rs-hero,
          .rs-kpiGrid,
          .rr-sectionGrid,
          .rs-mainGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .rs-shell {
            padding: 14px 12px 32px;
          }

          .rs-hero {
            padding: 18px;
          }

          .rs-hero h1 {
            font-size: 34px;
            max-width: none;
          }

          .rs-panel,
          .rs-kpiCard,
          .rs-loadingCard,
          .rr-heroCard {
            padding: 16px;
          }

          .rr-actionCard {
            grid-template-columns: 1fr;
          }

          .rr-assuranceItem,
          .rr-costRow {
            align-items: start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}