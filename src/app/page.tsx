"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ScoreRadarCard from "@/components/ScoreRadarCard";

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

const DOMAIN_MODULES = [
  {
    title: "Governance",
    score: 72,
    desc: "Policies, ownership, risk oversight and leadership accountability.",
    icon: "shield",
  },
  {
    title: "Technology",
    score: 58,
    desc: "Core security tooling, patching, access control and operational hygiene.",
    icon: "chip",
  },
  {
    title: "People",
    score: 61,
    desc: "Access lifecycle, awareness, roles and real-world security behaviour.",
    icon: "users",
  },
  {
    title: "Suppliers",
    score: 49,
    desc: "Third-party risk, contracts, critical dependencies and oversight.",
    icon: "link",
  },
  {
    title: "Recovery",
    score: 67,
    desc: "Backups, restore testing, continuity planning and recovery confidence.",
    icon: "refresh",
  },
  {
    title: "Incident Response",
    score: 55,
    desc: "Escalation, coordination, learning loops and response readiness.",
    icon: "bolt",
  },
];

function Icon({
  name,
  size = 18,
}: {
  name:
    | "radar"
    | "plan"
    | "evidence"
    | "check"
    | "map"
    | "bolt"
    | "shield"
    | "chip"
    | "users"
    | "link"
    | "refresh";
  size?: number;
}) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true };

  if (name === "radar") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 2a8 8 0 0 1 7.75 6H12V4Zm0 16a8 8 0 0 1-8-8h16a8 8 0 0 1-8 8Zm1-9h6.75A8 8 0 0 1 13 18Z" />
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
  if (name === "evidence") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM8 12h8v-2H8v2Zm0 4h8v-2H8v2Zm0 4h5v-2H8v2Z" />
      </svg>
    );
  }
  if (name === "map") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M15 5 9 3 3 5v16l6-2 6 2 6-2V3l-6 2Zm0 2.2 4-1.33V18.8l-4 1.33V7.2ZM9 5.2l4 1.33v12.93l-4-1.33V5.2Zm-2 .67v12.93L5 19.47V6.53l2-.66Z" />
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
  if (name === "shield") {
    return (
      <svg {...common}>
        <path fill="currentColor" d="M12 2 5 5v6c0 5 3.4 9.4 7 11 3.6-1.6 7-6 7-11V5l-7-3Zm0 2.2 5 2.14V11c0 3.85-2.42 7.18-5 8.53C9.42 18.18 7 14.85 7 11V6.34l5-2.14Z" />
      </svg>
    );
  }
  if (name === "chip") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M9 2h2v3h2V2h2v3h2a2 2 0 0 1 2 2v2h3v2h-3v2h3v2h-3v2a2 2 0 0 1-2 2h-2v3h-2v-3h-2v3H9v-3H7a2 2 0 0 1-2-2v-2H2v-2h3v-2H2V9h3V7a2 2 0 0 1 2-2h2V2Zm-2 5v10h10V7H7Zm2 2h6v6H9V9Z"
        />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M16 11a4 4 0 1 0-3.999-4A4 4 0 0 0 16 11ZM8 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-1.14.59-2.12 1.56-2.94A11.8 11.8 0 0 0 8 13Zm8 0c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z"
        />
      </svg>
    );
  }
  if (name === "link") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M10.59 13.41a1.996 1.996 0 0 1 0-2.82l3-3a2 2 0 1 1 2.82 2.82l-1 1 1.41 1.41 1-1a4 4 0 1 0-5.66-5.66l-3 3a4 4 0 0 0 5.66 5.66l.88-.88-1.41-1.41-.7.88a2 2 0 0 1-2.82 0ZM6.17 12.17l1-1-1.41-1.41-1 1a4 4 0 1 0 5.66 5.66l3-3a4 4 0 1 0-5.66-5.66l-.88.88 1.41 1.41.7-.88a2 2 0 0 1 2.82 2.82l-3 3a2 2 0 1 1-2.82-2.82Z"
        />
      </svg>
    );
  }
  if (name === "refresh") {
    return (
      <svg {...common}>
        <path
          fill="currentColor"
          d="M17.65 6.35A7.95 7.95 0 0 0 12 4V1L7 6l5 5V7a5 5 0 1 1-4.9 6h-2.02A7 7 0 1 0 17.65 6.35Z"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path fill="currentColor" d="M9.5 16.2 5.8 12.5 4.4 13.9l5.1 5.1L20 8.5 18.6 7.1 9.5 16.2Z" />
    </svg>
  );
}

function DomainModule({
  title,
  score,
  desc,
  icon,
}: {
  title: string;
  score: number;
  desc: string;
  icon: "shield" | "chip" | "users" | "link" | "refresh" | "bolt";
}) {
  return (
    <div className="moduleCard">
      <div className="moduleTop">
        <div className="moduleIcon">
          <Icon name={icon} size={20} />
        </div>
        <div className="moduleScore">{score}</div>
      </div>

      <div className="moduleTitle">{title}</div>
      <div className="moduleText">{desc}</div>
    </div>
  );
}

export default function HomePage() {
  const [industry, setIndustry] = useState<IndustryKey>("general");
  const copy = useMemo(() => INDUSTRY_COPY[industry], [industry]);

  return (
    <main className="homePage">
      <div className="homeShell">
        <section className="heroSection">
          <div className="heroGlow" />

          <div className="heroCopy">
            <div className="eyebrow">
              <Icon name="check" />
              SME cyber resilience maturity — simple, practical, evidence-led
            </div>

            <h1>
              Your <span>cyber resilience score</span>, in minutes
            </h1>

            <p className="heroLead">
              A fast, plain-English assessment that gives you an executive-ready summary, ranked priorities, a practical 90-day
              plan, and an evidence checklist you can actually use.
            </p>

            <div className="heroActions">
              <Link className="btn btnPrimary" href="/assessment">
                Start free assessment
              </Link>
              <Link className="btn btnSecondary" href="/methodology">
                Methodology
              </Link>
              <a className="btn btnTertiary" href="#industry">
                Industry view
              </a>
            </div>

            <div className="heroMeta">Takes ~10–15 minutes • 0–5 maturity scale • Results page + PDF report</div>

            <div className="heroMiniGrid">
              <div className="miniCard">
                <div className="miniHead">
                  <Icon name="radar" />
                  Clear baseline
                </div>
                <div className="miniText">See where disruption risk is coming from, ranked by priority.</div>
              </div>

              <div className="miniCard">
                <div className="miniHead">
                  <Icon name="plan" />
                  90-day plan
                </div>
                <div className="miniText">Practical actions focused on ownership, cadence, evidence and testing.</div>
              </div>

              <div className="miniCard">
                <div className="miniHead">
                  <Icon name="evidence" />
                  Evidence checklist
                </div>
                <div className="miniText">Know exactly what proof to keep so you can answer due diligence with confidence.</div>
              </div>
            </div>
          </div>

          <div className="heroVisual">
            <ScoreRadarCard />
          </div>
        </section>

        <section className="logoStripCard">
          <div className="logoStripItem">
            <strong>Score</strong>
            <span>Understand where you stand</span>
          </div>
          <div className="logoStripDivider" />
          <div className="logoStripItem">
            <strong>Prioritise</strong>
            <span>Focus on the right next 5 actions</span>
          </div>
          <div className="logoStripDivider" />
          <div className="logoStripItem">
            <strong>Prove</strong>
            <span>Keep the evidence customers ask for</span>
          </div>
        </section>

        <section className="lightSection">
          <div className="sectionHeading">
            <div className="sectionEyebrow">Platform view</div>
            <h2>Turn the domains into a clear control panel</h2>
            <p>
              Resiliscore works best when people can instantly see the modules, the scores and where attention is needed. This makes
              the product feel like software, not just content.
            </p>
          </div>

          <div className="moduleGrid">
            {DOMAIN_MODULES.map((item) => (
              <DomainModule
                key={item.title}
                title={item.title}
                score={item.score}
                desc={item.desc}
                icon={item.icon as "shield" | "chip" | "users" | "link" | "refresh" | "bolt"}
              />
            ))}
          </div>
        </section>

        <section className="sampleCallout">
          <div>
            <div className="sectionEyebrow dark">Sample report</div>
            <h2>Preview the Resiliscore report format</h2>
            <p>
              See the structure, tone and layout before you start. This sample is a public demonstration version designed to show the
              style of output clients receive.
            </p>
          </div>

          <div className="sampleCalloutActions">
            <Link className="btn btnPrimary" href="/assessment">
              Start free assessment
            </Link>
            <a className="btn btnSecondary" href="/sample-report.pdf" target="_blank" rel="noreferrer">
              View sample report
            </a>
          </div>
        </section>

        <section id="industry" className="industrySection">
          <div className="sectionHeading sectionHeadingDark">
            <div className="sectionEyebrow">Industry view</div>
            <h2>Why this matters in your industry</h2>
            <p style={{ color: "rgba(255,255.255,0.82)" }}>
              Same assessment, different impact. Select your industry to see how Resiliscore helps reduce disruption risk and improve
              due diligence.
            </p>
          </div>

          <div className="industryGrid">
            <div className="industryMain">
              <label className="fieldLabel" htmlFor="industry-select">
                Select your industry
              </label>

              <select
                id="industry-select"
                value={industry}
                onChange={(e) => setIndustry(e.target.value as IndustryKey)}
                className="industrySelect"
                aria-label="Select industry"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>

              <div className="industryCard">
                <div className="industryTitle">{copy.headline}</div>
                <p className="industrySub">{copy.sub}</p>

                <div className="industryCallout">
                  <div className="industryCalloutTitle">Common risk pattern</div>
                  <div className="industryCalloutText">{copy.commonRisk}</div>
                </div>

                <div className="industrySubHeading">What you typically gain</div>
                <ul className="industryList">
                  {copy.outcomes.map((b) => (
                    <li key={b}>
                      <span className="listDot" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="industrySubHeading">Typical evidence to keep</div>
                <ul className="industryList">
                  {copy.evidence.map((b) => (
                    <li key={b}>
                      <span className="listDot" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="industrySide">
              <div className="darkInfoCard">
                <div className="darkInfoHead">
                  <Icon name="check" />
                  The “so what?”
                </div>
                <div className="darkInfoText">
                  Your results show <b>where risk is coming from</b> and what to fix first. Most SMEs don’t need 50 initiatives —
                  they need the right 5, executed consistently, with evidence.
                </div>
              </div>

              <div className="darkInfoCard">
                <div className="darkInfoHead">
                  <Icon name="plan" />
                  Why the plan works
                </div>
                <div className="darkInfoText">
                  The 90-day plan focuses on improvements that reliably move maturity: <b>ownership</b>, <b>cadence</b>,{" "}
                  <b>evidence</b> and <b>testing</b>.
                </div>
              </div>

              <div className="darkInfoCard">
                <div className="darkInfoHead">
                  <Icon name="map" />
                  Framework mapping
                </div>
                <div className="darkInfoText">
                  Mapping helps you translate actions into terms others recognise for due diligence and structured improvement —
                  without turning the tool into a compliance monster.
                </div>
              </div>

              <div className="darkInfoCard darkInfoCardAccent">
                <div className="darkInfoHead">
                  <Icon name="bolt" />
                  Built for SMEs
                </div>
                <div className="darkInfoText">
                  Clear questions. Plain-English results. A report you can share internally. No jargon-first output.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="lightSection">
          <div className="sectionHeading">
            <div className="sectionEyebrow">How it works</div>
            <h2>A fast snapshot first — then deeper improvement over time</h2>
            <p>Simple enough to complete quickly, structured enough to drive meaningful action.</p>
          </div>

          <div className="stepsGrid">
            <div className="stepCard">
              <div className="stepNo">1</div>
              <div>
                <div className="stepTitle">Answer the assessment</div>
                <div className="stepText">Score each item 0–5 based on what is true today, not planned work.</div>
              </div>
            </div>

            <div className="stepCard">
              <div className="stepNo">2</div>
              <div>
                <div className="stepTitle">See results clearly</div>
                <div className="stepText">Dashboard visuals plus consultant-style interpretation that leaders can understand.</div>
              </div>
            </div>

            <div className="stepCard">
              <div className="stepNo">3</div>
              <div>
                <div className="stepTitle">Leave with a plan</div>
                <div className="stepText">Priorities, actions and evidence expectations you can actually implement.</div>
              </div>
            </div>
          </div>

          <div className="ctaPanel">
            <div>
              <div className="ctaPanelTitle">Ready to see where you stand?</div>
              <div className="ctaPanelText">Get your baseline in minutes, then turn it into a 90-day improvement plan.</div>
            </div>

            <div className="ctaPanelActions">
              <Link className="btn btnPrimary" href="/assessment">
                Start free assessment
              </Link>
              <Link className="btn btnSecondary" href="/methodology">
                Methodology
              </Link>
            </div>
          </div>
        </section>

        <section className="outcomesSection">
          <div className="sectionHeading sectionHeadingDark">
            <div className="sectionEyebrow">What you get</div>
            <h2>What you get after the assessment</h2>
            <p style={{ color: "rgba(255,255.255,0.82)" }}>Designed to leave you with a clear impression of where you are — and what to do next.</p>
          </div>

          <div className="outcomesGrid">
            <div className="outcomeCard">
              <div className="outcomeHead">
                <Icon name="radar" />
                Results dashboard
              </div>
              <div className="outcomeText">Radar plus ranked domain scores so risk is visible without technical overload.</div>
            </div>

            <div className="outcomeCard">
              <div className="outcomeHead">
                <Icon name="check" />
                Consultant-style interpretation
              </div>
              <div className="outcomeText">Plain-English meaning, strengths and priority risks designed for leadership decisions.</div>
            </div>

            <div className="outcomeCard">
              <div className="outcomeHead">
                <Icon name="plan" />
                90-day action plan
              </div>
              <div className="outcomeText">High-impact actions first. Assign owners and dates, then improve consistency over time.</div>
            </div>

            <div className="outcomeCard">
              <div className="outcomeHead">
                <Icon name="evidence" />
                Evidence checklist
              </div>
              <div className="outcomeText">Know what “good” proof looks like: policies, operational evidence, decisions and testing notes.</div>
            </div>
          </div>

          <div className="outcomesNote">
            Benefit: you can use the output to improve internally <b>and</b> respond more confidently to customer due diligence —
            without pretending it’s a certification.
          </div>
        </section>

        <section className="lightSection">
          <div className="sectionHeading">
            <div className="sectionEyebrow">Limitations</div>
            <h2>Clear expectations, kept simple</h2>
            <p>This is a prioritisation and improvement tool, not a badge.</p>
          </div>

          <div className="limitsGrid">
            <div className="limitCard">
              <div className="limitHead">
                <Icon name="check" />
                What this is
              </div>
              <ul className="limitList">
                <li>An SME-friendly maturity snapshot based on your answers.</li>
                <li>A plan to reduce disruption risk using practical controls.</li>
                <li>A consistent evidence view you can reuse for due diligence.</li>
              </ul>
            </div>

            <div className="limitCard">
              <div className="limitHead">
                <Icon name="check" />
                What this isn’t
              </div>
              <ul className="limitList">
                <li>Not a penetration test or vulnerability scan.</li>
                <li>Not an ISO certification or compliance attestation.</li>
                <li>Not a substitute for specialist advice where required.</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="footerPanel">
          <div>
            <div className="footerBrand">Resiliscore</div>
            <div className="footerText">Cyber resilience maturity for SMEs — practical, evidence-led and actionable.</div>
          </div>

          <div className="footerLinks">
            <Link href="/methodology">Methodology</Link>
            <Link href="/assessment">Start free assessment</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}