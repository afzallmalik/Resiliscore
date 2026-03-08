"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type IndustryKey =
  | "general"
  | "professional_services"
  | "construction"
  | "retail_ecommerce"
  | "healthcare"
  | "manufacturing"
  | "finance"
  | "education"
  | "hospitality"
  | "it_saas"
  | "charity";

const INDUSTRIES: { key: IndustryKey; label: string }[] = [
  { key: "general", label: "General SME" },
  { key: "professional_services", label: "Professional services (legal/accounting/consulting)" },
  { key: "construction", label: "Construction & property" },
  { key: "retail_ecommerce", label: "Retail / eCommerce" },
  { key: "healthcare", label: "Healthcare / clinics" },
  { key: "manufacturing", label: "Manufacturing / engineering" },
  { key: "finance", label: "Financial services" },
  { key: "education", label: "Education / training" },
  { key: "hospitality", label: "Hospitality / leisure" },
  { key: "it_saas", label: "IT / SaaS / MSP" },
  { key: "charity", label: "Charity / non-profit" },
];

type IndustryCopy = {
  headline: string;
  sub: string;
  outcomes: string[];
  evidence: string[];
  commonRisk: string;
};

const INDUSTRY_COPY: Record<IndustryKey, IndustryCopy> = {
  general: {
    headline: "Clarity on your real-world risk — and a plan you can actually execute",
    sub: "Most SMEs have ‘some security’. The gap is consistency, ownership and proof. Resiliscore turns scattered effort into a clear baseline with priorities.",
    outcomes: [
      "Clear top risk areas with plain-English explanation",
      "90-day plan focused on high impact, low friction improvements",
      "Evidence checklist so you can prove what you do without scrambling",
    ],
    evidence: ["Simple policies", "Proof of routine (reports/logs)", "Testing notes (restore/tabletop)"],
    commonRisk: "The typical SME problem isn’t lack of intent — it’s controls that exist ‘sometimes’ but aren’t owned or evidenced.",
  },
  professional_services: {
    headline: "Reduce questionnaire pain and win client trust faster",
    sub: "Clients care about confidentiality and professionalism. Resiliscore helps you translate cyber effort into the language procurement teams recognise.",
    outcomes: [
      "Cleaner answers to customer due diligence",
      "Less risk of email compromise and data leakage",
      "More confidence onboarding new clients and staff",
    ],
    evidence: ["MFA + leavers process", "Risk register + leadership review", "Incident plan + exercise notes"],
    commonRisk: "Professional services are disproportionately impacted by email compromise, data handling gaps, and supplier tooling sprawl.",
  },
  construction: {
    headline: "Protect invoices, suppliers and project continuity",
    sub: "Construction is frequently hit by invoice fraud and supplier compromise. Resiliscore prioritises controls that reduce financial loss and disruption.",
    outcomes: ["Stronger email/payment change controls", "Clear supplier/contractor access hygiene", "Recovery readiness if systems or files are hit"],
    evidence: ["MFA + approvals", "Backup restore test results", "Supplier access review cadence"],
    commonRisk: "Payment diversion and supplier compromise cause real cash loss — often without any ‘technical hack’ at all.",
  },
  retail_ecommerce: {
    headline: "Keep trading when things go wrong (and reduce account takeover risk)",
    sub: "Retail resilience is about uptime, accounts and fraud. Resiliscore highlights the controls most likely to prevent avoidable disruption.",
    outcomes: ["Reduced account takeover and admin abuse risk", "Improved operational discipline (patching, change, monitoring)", "Stronger recovery so sales can continue"],
    evidence: ["Admin access reviews", "Patch/vulnerability reporting", "Restore tests + targets"],
    commonRisk: "Retail incidents usually become serious when recovery is untested or when admin accounts are poorly controlled.",
  },
  healthcare: {
    headline: "Reduce patient-impact disruption and strengthen due diligence",
    sub: "Healthcare resilience is about availability and safety. Resiliscore focuses on access, recovery and response with evidence you can show.",
    outcomes: ["Stronger access control and account security", "Improved continuity and recovery readiness", "Cleaner escalation and incident learning loop"],
    evidence: ["Access reviews + MFA proof", "Restore tests + BC/DR notes", "Incident log + actions"],
    commonRisk: "In healthcare, downtime is the real harm — resilience and recovery maturity matter as much as prevention.",
  },
  manufacturing: {
    headline: "Reduce downtime and single points of failure",
    sub: "Manufacturing resilience depends on systems, dependencies and recoverability. Resiliscore helps you prioritise what protects production continuity.",
    outcomes: ["Critical system clarity (what must not fail)", "Stronger patching and secure operations routine", "Recovery targets and testing that actually prove you can restore"],
    evidence: ["Asset inventory + owners", "Patch SLA reporting", "Recovery runbooks + restore tests"],
    commonRisk: "Operational risk rises when critical dependencies aren’t known, and recovery is assumed rather than tested.",
  },
  finance: {
    headline: "Improve assurance and evidence clients expect",
    sub: "Financial services require consistency, traceability and control ownership. Resiliscore gives a structured baseline and measurable uplift plan.",
    outcomes: ["Clear governance and risk ownership", "Evidence-led control maturity (not just documents)", "Better supplier oversight and exception handling"],
    evidence: ["Leadership minutes + actions", "Exceptions/accepted risks", "Supplier clauses + reviews"],
    commonRisk: "The risk isn’t only ‘cyber’ — it’s weak evidence, uncontrolled exceptions and inconsistent operational routines.",
  },
  education: {
    headline: "Reduce disruption with practical, high-leverage controls",
    sub: "Education has high user volume and varied devices. Resiliscore prioritises access hygiene, patch discipline and recovery readiness.",
    outcomes: ["Improved identity controls and account hygiene", "More consistent patching and operations routine", "Clearer incident response and reporting"],
    evidence: ["Awareness/training proof", "Patch reporting", "Incident tabletop notes"],
    commonRisk: "Education environments drift quickly — resilience comes from routines and ownership, not one-off projects.",
  },
  hospitality: {
    headline: "Keep service running and reduce fraud/credential risk",
    sub: "Hospitality depends on systems working reliably. Resiliscore focuses on preventing avoidable downtime and account compromise.",
    outcomes: ["Reduced credential and email compromise risk", "Stronger backups and restore readiness", "Better supplier oversight for key systems"],
    evidence: ["MFA + leavers workflow", "Backup success + restore tests", "Supplier list + criticality tagging"],
    commonRisk: "Small operational gaps become big incidents when there’s no tested recovery path.",
  },
  it_saas: {
    headline: "Prove maturity to customers (and reduce operational surprises)",
    sub: "IT/SaaS firms are judged on reliability and response. Resiliscore tightens operational evidence, testing and consistent routines.",
    outcomes: ["Clear maturity profile for customer confidence", "Better operational proof (logging, patch SLAs, testing)", "Improved incident readiness and learning loop"],
    evidence: ["Central logging proof", "Patch SLAs + vuln closure", "IR playbooks + exercise outcomes"],
    commonRisk: "The difference between ‘we do security’ and ‘we can prove it’ is consistent evidence and testing.",
  },
  charity: {
    headline: "Protect donor data and keep services running with limited resources",
    sub: "Charities need high-impact, low-burden improvements. Resiliscore prioritises practical steps that reduce disruption risk without heavy overhead.",
    outcomes: ["Focus on the few controls that reduce most risk", "Quick wins on access hygiene (MFA/leavers)", "Backups and recovery that are tested, not assumed"],
    evidence: ["MFA proof", "Simple risk register", "Restore test notes"],
    commonRisk: "Resource constraints mean you must prioritise ruthlessly — Resiliscore helps you pick the 20% that removes 80% of risk.",
  },
};

function Icon({ name }: { name: "radar" | "plan" | "evidence" | "check" | "map" | "bolt" }) {
  if (name === "radar") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 2a8 8 0 0 1 7.75 6H12V4Zm0 16a8 8 0 0 1-8-8h16a8 8 0 0 1-8 8Zm1-9h6.75A8 8 0 0 1 13 18Z"
        />
      </svg>
    );
  }
  if (name === "plan") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 2h10a2 2 0 0 1 2 2v18l-7-3-7 3V4a2 2 0 0 1 2-2Zm2 6h6V6H9v2Zm0 4h6v-2H9v2Z"
        />
      </svg>
    );
  }
  if (name === "evidence") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM8 12h8v-2H8v2Zm0 4h8v-2H8v2Zm0 4h5v-2H8v2Z"
        />
      </svg>
    );
  }
  if (name === "map") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M15 5 9 3 3 5v16l6-2 6 2 6-2V3l-6 2Zm0 2.2 4-1.33V18.8l-4 1.33V7.2ZM9 5.2l4 1.33v12.93l-4-1.33V5.2Zm-2 .67v12.93L5 19.47V6.53l2-.66Z"
        />
      </svg>
    );
  }
  if (name === "bolt") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M13 2 3 14h7l-1 8 12-14h-7l-1-6Z" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9.5 16.2 5.8 12.5 4.4 13.9l5.1 5.1L20 8.5 18.6 7.1 9.5 16.2Z" />
    </svg>
  );
}

export default function HomePage() {
  const [industry, setIndustry] = useState<IndustryKey>("general");
  const copy = useMemo(() => INDUSTRY_COPY[industry], [industry]);

  return (
    <main>
      <div className="wrap">
        <section className="hero">
          <div className="heroBanner">
            <div className="heroBannerInner">
              <div className="pill">
                <Icon name="check" />
                SME cyber resilience maturity — simple, practical, evidence-led
              </div>

              <h1>Resiliscore: Understand your organisation's cyber resilience in 10 minutes</h1>

              <p className="lead">
                A fast, plain-English assessment that produces an executive-ready summary, ranked priorities, a 90-day plan, and an
                evidence checklist you can actually use.
              </p>

              <div className="ctaRow">
                <Link className="btn primary" href="/assessment">
                  Start free assessment
                </Link>
                <Link className="btn ghost" href="/methodology">
                  Methodology
                </Link>
                <a className="btn" href="#industry">
                  Industry view
                </a>
              </div>

              <div className="micro">Takes ~10–15 minutes • 0–5 maturity scale • Results page + PDF report</div>
            </div>
          </div>

          <div className="heroGrid">
            <div className="heroLeft heroPrimary">
              <h2>Know where you stand — and what to fix next</h2>

              <p className="lead">
                Resiliscore gives SMEs a clear maturity baseline across core resilience domains, explains what your score means in
                plain English, and produces a 90-day action plan with evidence you can show.
              </p>

              <div className="valueStrip">
                <div className="valueCard">
                  <div className="valueHead">
                    <Icon name="radar" /> Clear baseline
                  </div>
                  <div className="valueText">See where disruption risk is coming from, ranked by priority.</div>
                </div>
                <div className="valueCard">
                  <div className="valueHead">
                    <Icon name="plan" /> 90-day plan
                  </div>
                  <div className="valueText">Practical steps that move maturity fastest: owners, cadence, evidence, testing.</div>
                </div>
                <div className="valueCard">
                  <div className="valueHead">
                    <Icon name="evidence" /> Evidence checklist
                  </div>
                  <div className="valueText">Know exactly what to keep so you can prove consistency to customers.</div>
                </div>
              </div>

              <div className="quote">
                <div className="qMark">“</div>
                <div className="qBody">
                  A score is useful — but only if it becomes a plan. Resiliscore is designed to leave you with clarity, not just a number.
                </div>
              </div>
            </div>

            <div className="outputIntro heroSecondary">
              <div className="outputTop">
                <div className="outputTitle">
                  <Icon name="bolt" /> What the output feels like
                </div>
                <div className="outputSub muted">A modern, executive-ready snapshot — followed by a practical plan.</div>
              </div>

              <div className="outputGrid">
                <div className="outputLeft">
                  <div className="outputChips">
                    <div className="chip">
                      <Icon name="check" /> Executive summary
                    </div>
                    <div className="chip">
                      <Icon name="check" /> Ranked priorities
                    </div>
                    <div className="chip">
                      <Icon name="check" /> Evidence checklist
                    </div>
                    <div className="chip">
                      <Icon name="check" /> PDF report
                    </div>
                  </div>

                  <div className="outputHint muted">Designed to feel like a consultant deliverable — clear, calm, and actionable.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section sampleSection">
          <div className="sampleInner">
            <div>
              <div className="sampleKicker">Sample report</div>
              <h2>Preview the Resiliscore report format</h2>
              <p className="muted sampleText">
                See the structure, tone, and layout of the report before you start. This sample is a public demonstration version
                and is designed to show the style of output clients receive.
              </p>
            </div>

            <div className="sampleActions">
              <Link className="btn primary" href="/assessment">
                Start free assessment
              </Link>
              <a className="btn" href="/sample-report.pdf" target="_blank" rel="noreferrer">
                View sample report
              </a>
            </div>
          </div>
        </section>

        <section id="industry" className="section sectionStrong">
          <div className="sectionHead">
            <h2>Why this matters in your industry</h2>
            <p className="muted">
              Same assessment, different impact. Select your industry to see how Resiliscore helps you reduce disruption risk and improve due diligence.
            </p>
          </div>

          <div className="benefits">
            <div className="benefitsLeft">
              <div className="label">Select your industry</div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryKey)}
                className="select"
                aria-label="Select industry"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>

              <div className="benefitCard">
                <div className="benefitTitle">{copy.headline}</div>
                <p className="benefitText">{copy.sub}</p>

                <div className="callout">
                  <div className="calloutTitle">Common risk pattern</div>
                  <div className="calloutText">{copy.commonRisk}</div>
                </div>

                <div className="benefitSubTitle">What you typically gain</div>
                <ul className="benefitList">
                  {copy.outcomes.map((b) => (
                    <li key={b}>
                      <span className="dot" /> {b}
                    </li>
                  ))}
                </ul>

                <div className="benefitSubTitle" style={{ marginTop: 14 }}>
                  Typical evidence to keep
                </div>
                <ul className="benefitList">
                  {copy.evidence.map((b) => (
                    <li key={b}>
                      <span className="dot" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="benefitsRight">
              <div className="card">
                <div className="cardHead">
                  <Icon name="check" /> The “so what?”
                </div>
                <div className="cardText">
                  Your results show <b>where risk is coming from</b> and what to fix first. Most SMEs don’t need 50 initiatives — they need the right
                  5, executed consistently, with evidence.
                </div>
              </div>

              <div className="card">
                <div className="cardHead">
                  <Icon name="plan" /> Why the plan works
                </div>
                <div className="cardText">
                  The 90-day plan focuses on improvements that reliably move maturity: <b>ownership</b>, <b>cadence</b>, <b>evidence</b> and <b>testing</b>. That’s what reduces disruption risk in real life.
                </div>
              </div>

              <div className="card">
                <div className="cardHead">
                  <Icon name="map" /> Framework mapping (briefly)
                </div>
                <div className="cardText">
                  Mapping helps you translate actions into terms others recognise. It’s useful for customer due diligence and structured improvement — without turning the tool into a compliance monster.
                </div>
              </div>

              <div className="card soft">
                <div className="cardHead">
                  <Icon name="check" /> Built for SMEs
                </div>
                <div className="cardText">Clear questions. Plain-English results. A report you can share internally. No jargon-first output.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section sectionFlat">
          <div className="sectionHead">
            <h2>How it works</h2>
            <p className="muted">A fast snapshot first — then deeper improvement over time if you choose.</p>
          </div>

          <div className="how">
            <div className="howCard">
              <div className="howNum">1</div>
              <div>
                <div className="howTitle">Answer the assessment</div>
                <div className="howText">Score each item 0–5 based on what is true today (not planned work).</div>
              </div>
            </div>

            <div className="howCard">
              <div className="howNum">2</div>
              <div>
                <div className="howTitle">See results clearly</div>
                <div className="howText">Dashboard visuals + consultant-style summary that makes sense to leaders.</div>
              </div>
            </div>

            <div className="howCard">
              <div className="howNum">3</div>
              <div>
                <div className="howTitle">Leave with a plan</div>
                <div className="howText">Priorities, actions, and evidence expectations you can actually implement.</div>
              </div>
            </div>
          </div>

          <div className="ctaBanner">
            <div>
              <div className="ctaTitle">Ready to see where you stand?</div>
              <div className="muted">Get your baseline in minutes, then turn it into a 90-day improvement plan.</div>
            </div>
            <div className="ctaBtns">
              <Link className="btn primary" href="/assessment">
                Start free assessment
              </Link>
              <Link className="btn ghost" href="/methodology">
                Methodology
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="sectionHead">
            <h2>What you get after the assessment</h2>
            <p className="muted">Designed to leave you with a clear impression of where you are — and what to do next.</p>
          </div>

          <div className="get">
            <div className="getCard">
              <div className="getHead">
                <Icon name="radar" /> Results dashboard
              </div>
              <div className="getText">Radar + ranked domain scores so risk is visible. Perfect for internal discussion without technical overload.</div>
            </div>

            <div className="getCard">
              <div className="getHead">
                <Icon name="check" /> Consultant-style interpretation
              </div>
              <div className="getText">Plain-English meaning, strengths and priority risks — designed for leadership and decision-making.</div>
            </div>

            <div className="getCard">
              <div className="getHead">
                <Icon name="plan" /> 90-day action plan
              </div>
              <div className="getText">High-impact actions first. Assign owners and dates, then improve consistency and evidence over time.</div>
            </div>

            <div className="getCard">
              <div className="getHead">
                <Icon name="evidence" /> Evidence checklist
              </div>
              <div className="getText">Know what “good” proof looks like: policies, operational proof, decisions, and testing notes.</div>
            </div>
          </div>

          <div className="note">
            Benefit: you can use the output to improve internally <b>and</b> to respond more confidently to customer due diligence — without pretending it’s a certification.
          </div>
        </section>

        <section className="section sectionFlat">
          <div className="sectionHead">
            <h2>Limitations (kept simple)</h2>
            <p className="muted">Clear expectations: this is a prioritisation and improvement tool, not a badge.</p>
          </div>

          <div className="framework">
            <div className="frameworkCard">
              <div className="frameworkHead">
                <Icon name="check" /> What this is
              </div>
              <ul className="list">
                <li>An SME-friendly maturity snapshot based on your answers.</li>
                <li>A plan to reduce disruption risk using practical controls.</li>
                <li>A consistent evidence view you can reuse for due diligence.</li>
              </ul>
            </div>

            <div className="frameworkCard">
              <div className="frameworkHead">
                <Icon name="check" /> What this isn’t
              </div>
              <ul className="list">
                <li>Not a penetration test or vulnerability scan.</li>
                <li>Not an ISO certification or compliance attestation.</li>
                <li>Not a substitute for specialist advice where required.</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footLeft">
            <div className="footBrand">Resiliscore</div>
            <div className="muted">Cyber resilience maturity for SMEs — practical, evidence-led, and actionable.</div>
          </div>
          <div className="footRight">
            <Link className="footLink" href="/methodology">
              Methodology
            </Link>
            <Link className="footLink" href="/assessment">
              Start free assessment
            </Link>
          </div>
        </footer>
      </div>

      <style>{`
        .wrap { max-width: 1180px; margin: 0 auto; padding: 16px 16px 38px; display: grid; gap: 16px; }
        .muted { color: var(--muted); }
        h1, h2 { margin: 0; }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 42px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          color: var(--text);
          text-decoration: none;
          font-weight: 900;
          cursor: pointer;
        }
        .btn:hover { background: rgba(255,255,255,0.06); }
        .btn.primary {
          background: rgba(94,234,106,0.14);
          border-color: rgba(94,234,106,0.30);
        }
        .btn.primary:hover { background: rgba(94,234,106,0.18); }
        .btn.ghost { background: transparent; }

        .hero { display: grid; gap: 12px; align-items: start; }

        .heroBanner {
          border: 1px solid var(--border);
          border-radius: 18px;
          background:
            radial-gradient(900px 380px at 18% 10%, rgba(94,234,106,0.16), transparent 60%),
            radial-gradient(900px 380px at 90% 20%, rgba(255,255,255,0.10), transparent 55%),
            rgba(255,255,255,0.03);
          padding: 20px;
        }
        .heroBannerInner { max-width: 980px; }

        .pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.02);
          font-weight: 900;
          color: rgba(255,255,255,0.90);
          font-size: 13px;
        }

        .hero h1 {
          margin-top: 14px;
          font-size: 44px;
          line-height: 1.06;
          letter-spacing: -0.02em;
        }
        @media (max-width: 700px) { .hero h1 { font-size: 34px; } }

        .lead {
          margin-top: 12px;
          color: rgba(255,255,255,0.78);
          line-height: 1.65;
          max-width: 70ch;
          font-size: 16px;
        }

        .ctaRow { margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap; }
        .micro { margin-top: 12px; color: rgba(255,255,255,0.62); font-size: 13px; }

        .heroGrid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 12px;
          align-items: stretch;
        }
        @media (max-width: 1000px) { .heroGrid { grid-template-columns: 1fr; } }

        .heroPrimary {
          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          padding: 18px;
        }

        .heroSecondary {
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px;
          background: rgba(255,255,255,0.02);
          padding: 16px;
          overflow: hidden;
        }

        .outputTop { display: grid; gap: 6px; }
        .outputTitle { font-weight: 950; display: inline-flex; gap: 10px; align-items: center; }
        .outputSub { line-height: 1.6; }

        .outputGrid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          align-items: stretch;
        }

        .outputLeft {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
          display: grid;
          gap: 10px;
          align-content: start;
        }
        .outputChips { display: flex; gap: 10px; flex-wrap: wrap; }
        .outputHint { line-height: 1.6; }

        .chip {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          border-radius: 999px;
          padding: 8px 12px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.02);
          font-weight: 900;
          color: rgba(255,255,255,0.86);
          font-size: 13px;
        }

        .heroLeft h2 { font-size: 22px; }

        .valueStrip {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        @media (max-width: 900px) { .valueStrip { grid-template-columns: 1fr; } }

        .valueCard {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 12px;
        }
        .valueHead { display: inline-flex; gap: 10px; align-items: center; font-weight: 950; }
        .valueText { margin-top: 8px; color: rgba(255,255,255,0.74); line-height: 1.6; }

        .quote {
          margin-top: 14px;
          border: 1px solid rgba(94,234,106,0.18);
          border-radius: 18px;
          background: rgba(94,234,106,0.06);
          padding: 14px;
          display: grid;
          grid-template-columns: 22px 1fr;
          gap: 12px;
          align-items: start;
        }
        .qMark { font-size: 26px; font-weight: 950; color: rgba(94,234,106,0.90); line-height: 1; }
        .qBody { color: rgba(255,255,255,0.78); line-height: 1.6; }

        .section {
          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          padding: 18px;
        }
        .sectionStrong {
          background: rgba(255,255,255,0.035);
        }
        .sectionFlat {
          background: transparent;
          border-color: rgba(255,255,255,0.08);
        }
        .sectionHead h2 { font-size: 22px; }
        .sectionHead p { margin: 8px 0 0; line-height: 1.6; max-width: 92ch; }

        .sampleSection {
          background: rgba(255,255,255,0.025);
        }
        .sampleInner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .sampleKicker {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 8px;
        }
        .sampleText {
          margin-top: 10px;
          max-width: 75ch;
          line-height: 1.65;
        }
        .sampleActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .label { font-weight: 950; color: rgba(255,255,255,0.86); font-size: 13px; }
        .select {
          width: 100%;
          margin-top: 10px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.02);
          color: rgba(255,255,255,0.90);
          padding: 0 12px;
          font-weight: 900;
          outline: none;
        }
        .select:focus { border-color: rgba(94,234,106,0.38); box-shadow: 0 0 0 3px rgba(94,234,106,0.10); }

        .benefits {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 1000px) { .benefits { grid-template-columns: 1fr; } }

        .benefitsLeft {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 16px;
        }
        .benefitCard {
          margin-top: 12px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
        }
        .benefitTitle { font-weight: 950; font-size: 18px; }
        .benefitText { margin: 10px 0 0; color: rgba(255,255,255,0.72); line-height: 1.65; }

        .callout {
          margin-top: 12px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 12px;
        }
        .calloutTitle { font-weight: 950; color: rgba(255,255,255,0.88); font-size: 13px; }
        .calloutText { margin-top: 8px; color: rgba(255,255,255,0.70); line-height: 1.6; }

        .benefitSubTitle { margin-top: 12px; font-weight: 950; font-size: 13px; color: rgba(255,255,255,0.86); }
        .benefitList { margin: 10px 0 0; padding: 0; list-style: none; display: grid; gap: 10px; }
        .benefitList li { display: flex; gap: 10px; align-items: flex-start; color: rgba(255,255,255,0.88); line-height: 1.6; }
        .dot { width: 9px; height: 9px; border-radius: 99px; background: rgba(94,234,106,0.85); margin-top: 6px; flex: 0 0 auto; }

        .benefitsRight { display: grid; gap: 12px; }
        .card {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
        }
        .card.soft { background: rgba(94,234,106,0.06); border-color: rgba(94,234,106,0.18); }
        .cardHead { display: inline-flex; gap: 10px; align-items: center; font-weight: 950; color: rgba(255,255,255,0.90); }
        .cardText { margin-top: 10px; color: rgba(255,255,255,0.74); line-height: 1.65; }

        .how { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        @media (max-width: 900px) { .how { grid-template-columns: 1fr; } }
        .howCard {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
          display: grid;
          grid-template-columns: 42px 1fr;
          gap: 12px;
          align-items: start;
        }
        .howNum {
          width: 34px; height: 34px;
          border-radius: 12px;
          display: grid; place-items: center;
          font-weight: 950;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
        }
        .howTitle { font-weight: 950; }
        .howText { margin-top: 6px; color: rgba(255,255,255,0.74); line-height: 1.6; }

        .ctaBanner {
          margin-top: 14px;
          border: 1px solid rgba(94,234,106,0.18);
          border-radius: 18px;
          background: rgba(94,234,106,0.06);
          padding: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ctaTitle { font-weight: 950; font-size: 16px; }
        .ctaBtns { display: flex; gap: 10px; flex-wrap: wrap; }

        .get { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 900px) { .get { grid-template-columns: 1fr; } }
        .getCard {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
        }
        .getHead { display: inline-flex; gap: 10px; align-items: center; font-weight: 950; }
        .getText { margin-top: 10px; color: rgba(255,255,255,0.74); line-height: 1.65; }

        .note {
          margin-top: 12px;
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
          line-height: 1.65;
          color: rgba(255,255,255,0.78);
        }

        .framework { margin-top: 14px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 900px) { .framework { grid-template-columns: 1fr; } }
        .frameworkCard {
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          padding: 14px;
        }
        .frameworkHead { display: inline-flex; gap: 10px; align-items: center; font-weight: 950; }
        .list { margin: 10px 0 0; padding-left: 18px; color: rgba(255,255,255,0.78); line-height: 1.65; }
        .list li { margin: 7px 0; }

        .footer {
          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(255,255,255,0.03);
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .footBrand { font-weight: 950; }
        .footRight { display: flex; gap: 12px; flex-wrap: wrap; }
        .footLink { color: rgba(255,255,255,0.82); text-decoration: none; font-weight: 900; }
        .footLink:hover { text-decoration: underline; }
      `}</style>
    </main>
  );
}