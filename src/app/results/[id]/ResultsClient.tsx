"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
};

type ResultsPayload = {
  overall_score?: number;
  overallScore?: number;
  grade?: string;

  domain_scores?: any[];
  domainScores?: any[];

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
};

function toNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function maturityLabel(score: number) {
  if (score >= 4.5) return "Optimised";
  if (score >= 3.5) return "Managed";
  if (score >= 2.5) return "Defined";
  if (score >= 1.5) return "Repeatable";
  if (score >= 0.5) return "Ad hoc";
  return "Not in place";
}

function severity(score: number) {
  if (score < 1.5) return "high";
  if (score < 2.5) return "med";
  return "low";
}

function scoreBand(score: number): "very_low" | "low" | "mid" | "high" | "very_high" {
  if (score < 1.0) return "very_low";
  if (score < 2.0) return "low";
  if (score < 3.0) return "mid";
  if (score < 4.0) return "high";
  return "very_high";
}

function executiveSummary(overall: number) {
  const band = scoreBand(overall);

  if (band === "very_low") {
    return [
      "This suggests resilience controls are limited or not operating consistently in day-to-day practice.",
      "Fast wins usually come from ownership (who is accountable), access control (MFA + leavers), backup restore testing, and a simple risk register.",
      "Reduce disruption risk first, then turn improvements into repeatable routines with owners and dates.",
    ];
  }

  if (band === "low") {
    return [
      "Some controls are in place, but consistency and evidence may be patchy across domains.",
      "Prioritise the weakest 2–3 domains and convert them into routines (owner, cadence, evidence).",
      "Add basic measurement (restore success, patch timeliness, exercise cadence) to move maturity up quickly.",
    ];
  }

  if (band === "mid") {
    return [
      "Defined practices exist. The next step is making controls consistent, measurable and proven to work under pressure.",
      "Lift the weakest domains to avoid single points of failure.",
      "Introduce assurance: testing, evidence, and simple KPIs to prevent maturity drift.",
    ];
  }

  if (band === "high") {
    return [
      "Good consistency across most domains, with opportunities to strengthen assurance and measurement.",
      "Biggest gains now are proving effectiveness: testing, exercising and tightening exceptions.",
      "Keep standards strong as the business changes (new suppliers, new systems, growth).",
    ];
  }

  return [
    "Strong maturity foundations with disciplined operating practices and continuous improvement.",
    "Focus now is optimising assurance: measure what matters and reduce hidden risk.",
    "Maintain resilience through change by embedding controls into onboarding, procurement and system change.",
  ];
}

export default function ResultsClient({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "1";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<ResultsPayload | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/assessments/${id}/results`, { cache: "no-store" });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Could not load results (HTTP ${res.status}) ${t}`);
    }
    const json = (await res.json()) as ResultsPayload;
    setData(json);
    return json;
  }

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
  }, [id]);

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
      } catch {
        // ignore here; polling below may still succeed if webhook lands
      }

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
        } catch {
          // ignore transient errors
        }

        try {
          const latest = await load();
          const tier = (latest?.report_tier ?? latest?.reportTier ?? "free") as "free" | "premium";
          if (tier === "premium") {
            setNotice("Premium report unlocked ✅");
            return;
          }
        } catch {
          // ignore transient errors during polling
        }
      }

      setNotice("If your report is still locked, refresh once — payment may still be confirming.");
    } catch {
      setNotice("If your report is still locked, refresh once — payment may still be confirming.");
    }
  })();

  return () => {
    cancelled = true;
  };
}, [upgraded, id]);

  const normalized = useMemo(() => {
    const overall = toNum(data?.overall_score ?? data?.overallScore ?? 0, 0);
    const grade = String(data?.grade ?? "-");
    const raw = (data?.domain_scores ?? data?.domainScores ?? []) as DomainScoreRaw[];

    const scoreByKey = new Map<string, number>();
    for (const d of raw) {
      const key = String(d.name ?? d.domain_name ?? d.domainName ?? d.code ?? d.domain_code ?? d.domainCode ?? "").trim();
      if (!key) continue;
      scoreByKey.set(key, clamp(toNum(d.score, 0), 0, 5));
    }

    const domainScores = DOMAINS_V13.map((def) => {
      const byFull = scoreByKey.get(def.code);
      const byShort = scoreByKey.get(def.short);
      const score = byFull ?? byShort ?? 0;

      return {
        code: def.code,
        name: def.short,
        fullName: def.code,
        order: def.order,
        score: Number(score.toFixed(2)),
      };
    });

    const ranked = [...domainScores].sort((a, b) => a.score - b.score);
    const risks = ranked.slice(0, 3);
    const strengths = ranked.slice(-3).reverse();
    const exec = executiveSummary(overall);

    const tier = (data?.report_tier ?? data?.reportTier ?? "free") as "free" | "premium";

    return {
      overall: Number(overall.toFixed(2)),
      grade,
      domainScores,
      ranked,
      strengths,
      risks,
      execSummary: exec,
      email: data?.email ?? null,
      companyName: data?.company_name ?? data?.companyName ?? null,
      industry: data?.industry ?? null,
      reportReference: data?.report_reference ?? data?.reportReference ?? null,
      interpretation: data?.interpretation ?? "This is an indicative resilience snapshot based on your responses.",
      reportTier: tier,
    };
  }, [data]);

  async function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied.");
    } catch {
      alert("Could not copy link (browser blocked clipboard).");
    }
  }

  function goCheckout() {
    window.location.href = `/api/checkout?assessmentId=${encodeURIComponent(id)}`;
  }

  if (loading) {
    return (
      <main>
        <div className="panel" style={{ padding: 26 }}>
          <div className="muted">Loading results…</div>
        </div>
      </main>
    );
  }

  if (err || !data) {
    return (
      <main>
        <div className="panel" style={{ padding: 26 }}>
          <h2 style={{ marginTop: 0 }}>Results</h2>
          <p className="muted">{err ?? "Result not found."}</p>
          <Link className="btn" href="/assessment">
            Start a new assessment
          </Link>
        </div>
      </main>
    );
  }

  const {
    overall,
    grade,
    ranked,
    strengths,
    risks,
    execSummary,
    email,
    companyName,
    industry,
    reportReference,
    interpretation,
    reportTier,
  } = normalized;

  const isPremium = reportTier === "premium";

  return (
    <main>
      <div className="results-wrap">
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="muted" style={{ fontSize: 13 }}>
                Resiliscore Results
              </div>
              <h1 className="panel-title">Your maturity baseline</h1>

              <div className="meta-row">
                {email ? (
                  <div className="meta-pill">
                    Email: <span>{email}</span>
                  </div>
                ) : null}
                {companyName ? (
                  <div className="meta-pill">
                    Company: <span>{companyName}</span>
                  </div>
                ) : null}
                {industry ? (
                  <div className="meta-pill">
                    Industry: <span>{industry}</span>
                  </div>
                ) : null}
                {reportReference ? (
                  <div className="meta-pill">
                    Ref: <span>{reportReference}</span>
                  </div>
                ) : null}
                <div className="meta-pill">
                  Report: <span>{isPremium ? "Premium" : "Free dashboard"}</span>
                </div>
              </div>

              {notice ? <div className="notice">{notice}</div> : null}
            </div>

            <div className="panel-actions">
              {isPremium ? (
                <a className="btn primary" href={`/api/assessments/${id}/pdf`} target="_blank" rel="noreferrer">
                  Download PDF report
                </a>
              ) : (
                <button className="btn primary" type="button" onClick={goCheckout}>
                  Unlock Premium Report — £99
                </button>
              )}

              <button className="btn" type="button" onClick={copyLink}>
                Copy link
              </button>
              <Link className="btn" href="/assessment">
                New assessment
              </Link>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi">
              <div className="kpi-label">Overall score</div>
              <div className="kpi-value">{overall}</div>
              <div className="kpi-sub muted">Out of 5</div>
            </div>

            <div className="kpi">
              <div className="kpi-label">Grade</div>
              <div className="kpi-value">{grade}</div>
              <div className="kpi-sub muted">{maturityLabel(overall)}</div>
            </div>

            <div className="kpi kpi-wide">
              <div className="kpi-label">Interpretation</div>
              <div className="kpi-text">{interpretation}</div>
            </div>
          </div>
        </div>

        <div className="grid-two">
          <div className="panel">
            <div className="panel-section-title">Executive summary</div>
            <div className="card-lite">
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {execSummary.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>

            {!isPremium ? (
              <div className="upsell">
                <div className="upsell-kicker">Free dashboard complete</div>
                <div className="upsell-title">Unlock Your Full Premium Report — £99</div>
                <div className="muted" style={{ lineHeight: 1.6 }}>
                  Your dashboard shows the score. The premium report shows what it means, where your real risks are, and what to fix first.
                </div>

                <div className="upsell-list">
                  <div className="upsell-item">• Detailed domain-by-domain analysis</div>
                  <div className="upsell-item">• Real-world failure scenarios and exposure</div>
                  <div className="upsell-item">• Tailored next actions and target state</div>
                  <div className="upsell-item">• 30/60/90 improvement plan</div>
                  <div className="upsell-item">• Branded downloadable PDF report</div>
                </div>

                <div className="upsell-actions">
                  <button className="btn primary" type="button" onClick={goCheckout}>
                    Unlock Full Report — £99
                  </button>
                </div>

                <div className="muted upsell-foot">One-time payment. Instant access after checkout.</div>
              </div>
            ) : null}
          </div>

          <div className="panel">
            <div className="panel-section-title">Domain scores</div>
            <div className="muted" style={{ marginBottom: 14 }}>
              Weakest to strongest (top = highest risk priority).
            </div>

            <div className="chart">
              {ranked.map((d) => {
                const widthPct = (d.score / 5) * 100;
                const sev = severity(d.score);
                return (
                  <div key={d.code} className="chart-row">
                    <div className="chart-name">{d.name}</div>
                    <div className="chart-bar">
                      <div className={`chart-fill ${sev}`} style={{ width: `${widthPct}%` }} />
                    </div>
                    <div className="chart-score">
                      {d.score.toFixed(2)}
                      <div className="chart-tag muted">{maturityLabel(d.score)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="divider" />

            <div className="panel-section-title">Highlights</div>

            <div className="hl-block">
              <div className="hl-title">Top strengths</div>
              <div className="chips">
                {strengths.map((d) => (
                  <div key={d.code} className="chip low">
                    <div className="chip-name">{d.name}</div>
                    <div className="chip-score">{d.score.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hl-block" style={{ marginTop: 14 }}>
              <div className="hl-title">Top risk areas</div>
              <div className="chips">
                {risks.map((d) => (
                  <div key={d.code} className={`chip ${severity(d.score)}`}>
                    <div className="chip-name">{d.name}</div>
                    <div className="chip-score">{d.score.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="divider" />

            {!isPremium ? (
              <div className="deliverables">
                <div className="deliverables-title">Premium PDF report — £99</div>
                <div className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
                  Unlock the full consultant-style report with tailored analysis, action planning, and a downloadable branded PDF.
                </div>
                <div className="deliverables-row" style={{ marginTop: 12 }}>
                  <button className="btn primary" type="button" onClick={goCheckout}>
                    Unlock Premium Report — £99
                  </button>
                </div>
                <div className="muted upsell-foot" style={{ marginTop: 10 }}>
                  One-time payment. Instant access after checkout.
                </div>
              </div>
            ) : (
              <div className="deliverables">
                <div className="deliverables-title">Deliverables</div>
                <div className="deliverables-row">
                  <a className="btn primary" href={`/api/assessments/${id}/pdf`} target="_blank" rel="noreferrer">
                    Download PDF report
                  </a>
                </div>
              </div>
            )}

            <div className="support-box">
              For support or interpretation help contact <strong>hello@resiliscore.co.uk</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .results-wrap { margin-top: 20px; display: grid; gap: 18px; }
        .panel { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; box-shadow: var(--shadow); }
        .panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .panel-title { margin: 6px 0 0; font-size: 28px; line-height: 1.15; }
        .panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .meta-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .meta-pill { border: 1px solid var(--border); background: rgba(255,255,255,0.02); border-radius: 999px; padding: 6px 10px; font-size: 13px; color: var(--muted); }
        .meta-pill span { color: var(--text); }

        .notice {
          margin-top: 12px;
          border: 1px solid rgba(94,234,106,0.20);
          background: rgba(94,234,106,0.08);
          border-radius: 14px;
          padding: 10px 12px;
          color: rgba(255,255,255,0.86);
          font-weight: 700;
        }

        .kpis { margin-top: 18px; display: grid; grid-template-columns: 1fr 1fr 2fr; gap: 14px; }
        @media (max-width: 900px) { .kpis { grid-template-columns: 1fr; } }
        .kpi { border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: rgba(255,255,255,0.02); }
        .kpi-label { font-size: 13px; color: var(--muted); }
        .kpi-value { font-size: 34px; font-weight: 800; margin-top: 6px; }
        .kpi-sub { margin-top: 4px; }
        .kpi-text { margin-top: 8px; color: var(--text); line-height: 1.55; }

        .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        @media (max-width: 900px) { .grid-two { grid-template-columns: 1fr; } }

        .panel-section-title { font-weight: 800; font-size: 16px; margin-bottom: 8px; }
        .divider { height: 1px; background: var(--border); margin: 16px 0; }

        .chart { display: grid; gap: 12px; }
        .chart-row { display: grid; grid-template-columns: 1.2fr 1.6fr 0.6fr; gap: 12px; align-items: center; }
        @media (max-width: 900px) { .chart-row { grid-template-columns: 1fr; gap: 8px; } }
        .chart-name { font-weight: 600; }
        .chart-bar { height: 12px; border-radius: 999px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); overflow: hidden; }
        .chart-fill { height: 100%; border-radius: 999px; }
        .chart-fill.high { background: rgba(255, 120, 120, 0.55); }
        .chart-fill.med  { background: rgba(255, 205, 120, 0.55); }
        .chart-fill.low  { background: rgba(94,234,106,0.55); }
        .chart-score { text-align: right; font-weight: 800; }
        @media (max-width: 900px) { .chart-score { text-align: left; } }
        .chart-tag { font-size: 12px; margin-top: 2px; }

        .hl-title { font-weight: 700; margin-bottom: 10px; }
        .chips { display: grid; gap: 10px; }
        .chip { display: flex; justify-content: space-between; gap: 10px; padding: 12px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); }
        .chip.high { border-color: rgba(255,120,120,0.35); }
        .chip.med  { border-color: rgba(255,205,120,0.35); }
        .chip.low  { border-color: rgba(94,234,106,0.30); }
        .chip-name { font-weight: 600; }
        .chip-score { font-weight: 800; }

        .card-lite { border: 1px solid var(--border); border-radius: 14px; padding: 14px; background: rgba(255,255,255,0.02); }

        .deliverables { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border); }
        .deliverables-title { font-weight: 800; margin-bottom: 10px; }
        .deliverables-row { display: flex; gap: 10px; flex-wrap: wrap; }

        .upsell {
          margin-top: 14px;
          border: 1px solid rgba(94,234,106,0.18);
          background: rgba(94,234,106,0.06);
          border-radius: 16px;
          padding: 16px;
        }
        .upsell-kicker {
          font-size: 12px;
          font-weight: 800;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 6px;
        }
        .upsell-title { font-weight: 900; margin-bottom: 8px; font-size: 18px; }
        .upsell-list {
          display: grid;
          gap: 8px;
          margin-top: 14px;
        }
        .upsell-item {
          color: rgba(255,255,255,0.88);
          line-height: 1.5;
        }
        .upsell-actions { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; }
        .upsell-foot {
          font-size: 13px;
        }
        .support-box {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          font-size: 13px;
          color: var(--muted);
        }
      `}</style>
    </main>
  );
}