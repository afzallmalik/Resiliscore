"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DOMAINS_V13 } from "@/lib/domains";
import ResultsRadarCard from "@/components/ResultsRadarCard";

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
};

function toNum(v: unknown, fallback = 0) {
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
      "Fast wins usually come from ownership, access control, backup restore testing, and a simple risk register.",
      "Reduce disruption risk first, then turn improvements into repeatable routines with owners and dates.",
    ];
  }

  if (band === "low") {
    return [
      "Some controls are in place, but consistency and evidence may be patchy across domains.",
      "Prioritise the weakest 2–3 domains and convert them into routines with an owner, cadence and evidence.",
      "Add basic measurement like restore success, patch timeliness and exercise cadence to move maturity up quickly.",
    ];
  }

  if (band === "mid") {
    return [
      "Defined practices exist. The next step is making controls consistent, measurable and proven to work under pressure.",
      "Lift the weakest domains to avoid single points of failure.",
      "Introduce assurance through testing, evidence and simple KPIs to prevent maturity drift.",
    ];
  }

  if (band === "high") {
    return [
      "Good consistency across most domains, with opportunities to strengthen assurance and measurement.",
      "Biggest gains now are proving effectiveness through testing, exercising and tighter exception control.",
      "Keep standards strong as the business changes through growth, new systems and new suppliers.",
    ];
  }

  return [
    "Strong maturity foundations with disciplined operating practices and continuous improvement.",
    "Focus now is optimising assurance, measuring what matters and reducing hidden risk.",
    "Maintain resilience through change by embedding controls into onboarding, procurement and system change.",
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
    | "star"
    | "risk"
    | "arrow";
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
  if (name === "star") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
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

  return (
    <svg {...common}>
      <path fill="currentColor" d="M12 4 10.59 5.41 16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8Z" />
    </svg>
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
          <div className="rs-domainLabel">{maturityLabel(score)}</div>
        </div>
        <div className={`rs-domainBadge ${sev}`}>{score.toFixed(2)}</div>
      </div>

      <div className="rs-domainTrack">
        <div className={`rs-domainFill ${sev}`} style={{ width: pct }} />
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
        } catch {
          // ignore; polling below may still succeed
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
            // ignore transient errors
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
  }, [upgraded, id, load]);

  const normalized = useMemo(() => {
    const overall = toNum(data?.overall_score ?? data?.overallScore ?? 0, 0);
    const grade = String(data?.grade ?? "-");
    const raw = (data?.domain_scores ?? data?.domainScores ?? []) as DomainScoreRaw[];

    const scoreByKey = new Map<string, number>();

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
      downloadToken: data?.downloadToken ?? null,
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
            <div className="rs-loadingText">Loading results…</div>
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
            <h2 style={{ marginTop: 0 }}>Results</h2>
            <p className="rs-muted">{err ?? "Result not found."}</p>
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
    domainScores,
    downloadToken,
  } = normalized;

  const isPremium = reportTier === "premium";

  const radarPoints = domainScores.map((d) => ({
    label: d.name,
    value: d.score,
  }));

  return (
    <main>
      <div className="rs-shell">
        <section className="rs-hero">
          <div className="rs-heroCopy">
            <div className="rs-kicker">
              <Icon name="check" />
              Resiliscore Results
            </div>

            <h1>Your maturity baseline</h1>
            <p className="rs-heroLead">
              This dashboard shows where your resilience is strongest, where your main risks sit, and what needs attention first.
            </p>

            <div className="rs-metaRow">
              {email ? (
                <div className="rs-pill">
                  Email <span>{email}</span>
                </div>
              ) : null}
              {companyName ? (
                <div className="rs-pill">
                  Company <span>{companyName}</span>
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
                Report <span>{isPremium ? "Premium" : "Free dashboard"}</span>
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
                  Download PDF report
                </a>
              ) : (
                <button className="rs-btn rs-btnPrimary" type="button" onClick={goCheckout}>
                  <Icon name="bolt" />
                  Unlock Premium Report — £99
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

          <div className="rs-heroVisual">
            <ResultsRadarCard overall={overall} grade={grade} points={radarPoints} />
          </div>
        </section>

        <section className="rs-kpiGrid">
          <div className="rs-kpiCard">
            <div className="rs-kpiLabel">Overall score</div>
            <div className="rs-kpiValue">{overall.toFixed(2)}</div>
            <div className="rs-kpiSub">Out of 5</div>
          </div>

          <div className="rs-kpiCard">
            <div className="rs-kpiLabel">Maturity level</div>
            <div className="rs-kpiValue rs-kpiValueSmall">{maturityLabel(overall)}</div>
            <div className="rs-kpiSub">Grade {grade}</div>
          </div>

          <div className="rs-kpiCard rs-kpiWide">
            <div className="rs-kpiLabel">Interpretation</div>
            <div className="rs-kpiText">{interpretation}</div>
          </div>
        </section>

        <section className="rs-mainGrid">
          <div className="rs-column">
            <div className="rs-panel rs-panelLight">
              <div className="rs-panelHead">
                <div className="rs-panelTitle">Executive summary</div>
              </div>

              <div className="rs-summaryList">
                {execSummary.map((x, i) => (
                  <div key={i} className="rs-summaryItem">
                    <span className="rs-summaryDot" />
                    <span>{x}</span>
                  </div>
                ))}
              </div>
            </div>

            {!isPremium ? (
              <div className="rs-panel rs-upsell">
                <div className="rs-upsellKicker">Free dashboard complete</div>
                <div className="rs-upsellTitle">Unlock your full premium report — £99</div>
                <div className="rs-upsellText">
                  Your dashboard shows the score. The premium report explains what it means, where your real risks are, and what to
                  fix first.
                </div>

                <div className="rs-featureList">
                  <div className="rs-featureItem">
                    <Icon name="check" />
                    Detailed domain-by-domain analysis
                  </div>
                  <div className="rs-featureItem">
                    <Icon name="check" />
                    Real-world failure scenarios and exposure
                  </div>
                  <div className="rs-featureItem">
                    <Icon name="check" />
                    Tailored next actions and target state
                  </div>
                  <div className="rs-featureItem">
                    <Icon name="check" />
                    30 / 60 / 90 day improvement plan
                  </div>
                  <div className="rs-featureItem">
                    <Icon name="check" />
                    Branded downloadable PDF report
                  </div>
                </div>

                <div className="rs-upsellActions">
                  <button className="rs-btn rs-btnPrimary" type="button" onClick={goCheckout}>
                    <Icon name="bolt" />
                    Unlock Full Report — £99
                  </button>
                </div>

                <div className="rs-upsellFoot">One-time payment. Instant access after checkout.</div>
              </div>
            ) : null}
          </div>

          <div className="rs-column">
            <div className="rs-panel rs-panelDark">
              <div className="rs-panelHead">
                <div>
                  <div className="rs-panelTitle rs-panelTitleLight">Domain scores</div>
                  <div className="rs-panelSub">Weakest to strongest — top items are your highest priority.</div>
                </div>
              </div>

              <div className="rs-domainGrid">
                {ranked.map((d) => (
                  <DomainCard key={d.code} name={d.name} score={d.score} />
                ))}
              </div>
            </div>

            <div className="rs-sideGrid">
              <div className="rs-panel rs-panelLight">
                <div className="rs-miniHead rs-good">
                  <Icon name="star" />
                  Top strengths
                </div>

                <div className="rs-chipStack">
                  {strengths.map((d) => (
                    <div key={d.code} className="rs-chip rs-chipGood">
                      <span>{d.name}</span>
                      <strong>{d.score.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rs-panel rs-panelLight">
                <div className="rs-miniHead rs-risk">
                  <Icon name="risk" />
                  Top risk areas
                </div>

                <div className="rs-chipStack">
                  {risks.map((d) => (
                    <div key={d.code} className={`rs-chip ${severity(d.score) === "high" ? "rs-chipHigh" : "rs-chipMed"}`}>
                      <span>{d.name}</span>
                      <strong>{d.score.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rs-panel rs-panelLight">
              {isPremium ? (
                <>
                  <div className="rs-deliverablesTitle">Deliverables</div>
                  <div className="rs-deliverablesText">Your premium report is ready to download as a branded consultant-style PDF.</div>
                  <div className="rs-deliverablesActions">
                   <a
 		     className="rs-btn rs-btnPrimary"
  		     href={`/api/assessments/${id}/pdf?token=${encodeURIComponent(downloadToken ?? "")}`}
  		     target="_blank"
  		     rel="noreferrer"
		   >
                      <Icon name="download" />
                      Download PDF report
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <div className="rs-deliverablesTitle">Premium PDF report — £99</div>
                  <div className="rs-deliverablesText">
                    Unlock the full consultant-style report with tailored analysis, action planning and a downloadable branded PDF.
                  </div>
                  <div className="rs-deliverablesActions">
                    <button className="rs-btn rs-btnPrimary" type="button" onClick={goCheckout}>
                      <Icon name="bolt" />
                      Unlock Premium Report — £99
                    </button>
                  </div>
                  <div className="rs-deliverablesFoot">One-time payment. Instant access after checkout.</div>
                </>
              )}
            </div>

            <div className="rs-support">
              For support or interpretation help contact <strong>hello@resiliscore.co.uk</strong>
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
          color: rgba(255,255,255,0.78);
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
          grid-template-columns: 1.02fr 0.98fr;
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
          font-size: 46px;
          line-height: 1.04;
          letter-spacing: -0.03em;
        }

        .rs-heroLead {
          margin: 14px 0 0;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          max-width: 58ch;
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

        .rs-heroVisual {
          display: flex;
          align-items: stretch;
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

        .rs-mainGrid {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
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
          color: rgba(255,255,255,0.66);
          line-height: 1.6;
        }

        .rs-summaryList {
          display: grid;
          gap: 12px;
        }

        .rs-summaryItem {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: rgba(6,27,34,0.82);
          line-height: 1.65;
          padding: 12px 0;
          border-bottom: 1px solid rgba(6,27,34,0.06);
        }

        .rs-summaryItem:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .rs-summaryDot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #0db17b;
          margin-top: 8px;
          flex: 0 0 auto;
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

        .rs-sideGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .rs-miniHead {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-weight: 850;
          font-size: 16px;
        }

        .rs-miniHead.rs-good {
          color: #0a8d62;
        }

        .rs-miniHead.rs-risk {
          color: #c94a4a;
        }

        .rs-chipStack {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .rs-chip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-radius: 14px;
          padding: 12px 14px;
          border: 1px solid rgba(6,27,34,0.08);
          background: #fbfcfd;
          color: #061b22;
        }

        .rs-chipGood {
          border-color: rgba(13,177,123,0.20);
          background: rgba(13,177,123,0.06);
        }

        .rs-chipMed {
          border-color: rgba(255,193,7,0.24);
          background: rgba(255,193,7,0.08);
        }

        .rs-chipHigh {
          border-color: rgba(255,107,107,0.24);
          background: rgba(255,107,107,0.08);
        }

        .rs-chip strong {
          font-weight: 900;
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
        }

        .rs-support {
          color: rgba(255,255,255,0.72);
          font-size: 13px;
          padding: 0 4px;
        }

        .rr-card {
          width: 100%;
          border-radius: 24px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 12px 30px rgba(3,16,22,0.10);
          padding: 20px;
          display: grid;
          gap: 18px;
        }

        .rr-top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: start;
        }

        .rr-kicker {
          color: #0a8d62;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .rr-card h3 {
          margin: 8px 0 0;
          color: #061b22;
          font-size: 25px;
          line-height: 1.1;
        }

        .rr-card p {
          margin: 10px 0 0;
          color: rgba(6,27,34,0.72);
          line-height: 1.6;
        }

        .rr-scoreBox {
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(13,177,123,0.14), rgba(13,177,123,0.05));
          border: 1px solid rgba(13,177,123,0.18);
          padding: 12px 14px;
          display: grid;
          justify-items: end;
          min-width: 112px;
        }

        .rr-scoreLabel {
          color: rgba(6,27,34,0.60);
          font-size: 12px;
          font-weight: 700;
        }

        .rr-scoreValue {
          margin-top: 4px;
          color: #061b22;
          font-size: 34px;
          line-height: 1;
          font-weight: 900;
        }

        .rr-scoreSub {
          color: rgba(6,27,34,0.65);
          font-size: 13px;
          font-weight: 700;
          margin-top: 4px;
        }

        .rr-chartWrap {
          display: flex;
          justify-content: center;
        }

        .rr-chart {
          width: 100%;
          max-width: 360px;
          height: auto;
        }

        .rr-legend {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .rr-legendItem {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(6,27,34,0.07);
          border-radius: 14px;
          padding: 10px 12px;
          background: #fafcfc;
        }

        .rr-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #0db17b;
          flex: 0 0 auto;
        }

        .rr-label {
          flex: 1;
          color: #061b22;
          font-weight: 700;
        }

        .rr-value {
          color: #0a8d62;
          font-weight: 900;
        }

        @media (max-width: 1080px) {
          .rs-hero,
          .rs-mainGrid,
          .rs-kpiGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .rs-sideGrid,
          .rr-legend {
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
            font-size: 36px;
          }

          .rs-panel,
          .rs-kpiCard,
          .rr-card,
          .rs-loadingCard {
            padding: 16px;
          }

          .rr-top {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}