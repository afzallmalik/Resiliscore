import Link from "next/link";
import { DOMAINS_V13 } from "@/lib/domains";

export const dynamic = "force-dynamic";

const GRADE_BANDS = [
  { grade: "A", range: "4.5 – 5.0", meaning: "Optimised: measured, tested, improving." },
  { grade: "B", range: "3.5 – 4.49", meaning: "Managed: consistent, owned, repeatable." },
  { grade: "C", range: "2.5 – 3.49", meaning: "Defined: documented, uneven consistency." },
  { grade: "D", range: "1.5 – 2.49", meaning: "Repeatable: some routine, notable gaps." },
  { grade: "E", range: "0.0 – 1.49", meaning: "Not in place: informal, reactive." },
];

const EVIDENCE = [
  {
    title: "Policy & Standards",
    examples: ["Information security policy", "Access control policy", "Backup/retention rules", "Supplier clauses"],
  },
  {
    title: "Operational Proof",
    examples: ["MFA enabled", "Leaver removal record", "Patch reports", "Backup success logs"],
  },
  {
    title: "Risk & Decisions",
    examples: ["Risk register", "Leadership reviews", "Accepted risk sign-offs"],
  },
  {
    title: "Testing & Exercises",
    examples: ["Restore test results", "Incident tabletop", "Lessons learned log"],
  },
];

export default function MethodologyPage() {
  return (
    <main>
      <div className="wrap">
        {/* HEADER */}
        <div className="panel hero">
          <div className="head">
            <div>
              <div className="muted small">Resiliscore Methodology</div>
              <h1 className="title">How your score is calculated</h1>
              <p className="sub">
                A practical 0–5 maturity model designed for SMEs. It measures whether controls exist,
                operate consistently, and can be evidenced.
              </p>
            </div>

            <div className="actions">
              <Link className="btn primary" href="/assessment">
                Start assessment
              </Link>
              <Link className="btn ghost" href="/">
                Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* TILE SECTION */}
        <div className="tileGrid">
          <div className="panel tile">
            <div className="sectionTitle">What Resiliscore measures</div>
            <ul className="bullets">
              <li>
                <b>Controls</b> — the right safeguards exist.
              </li>
              <li>
                <b>Consistency</b> — they operate reliably day-to-day (not just “on paper”).
              </li>
              <li>
                <b>Evidence</b> — you can prove it quickly if asked (logs, actions, policies, tests).
              </li>
            </ul>
          </div>

          <div className="panel tile">
            <div className="sectionTitle">How to answer</div>
            <ul className="bullets">
              <li>Score what is true <b>today</b>.</li>
              <li>If uneven across teams, score lower.</li>
              <li>When unsure, choose the lower score.</li>
              <li>Think: “could I evidence this quickly?”</li>
            </ul>
          </div>

          <div className="panel tileWide">
            <div className="sectionTitle">Domains covered</div>
            <div className="muted small" style={{ marginTop: -2, marginBottom: 12 }}>
              Resiliscore focuses on the areas that most often cause disruption for SMEs — operations, access, recovery,
              suppliers, and response.
            </div>

            <div className="domainGrid">
              {DOMAINS_V13.map((d) => (
                <div key={d.code} className="domainCard">
                  <div className="domainShort">{d.short}</div>
                  <div className="domainFull muted">{d.code}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel tileWide">
            <div className="sectionTitle">Evidence checklist</div>
            <div className="muted small" style={{ marginTop: -2, marginBottom: 12 }}>
              You don’t need perfect documentation. You need clear ownership + simple evidence you can find quickly.
            </div>

            <div className="evidenceGrid">
              {EVIDENCE.map((e) => (
                <div key={e.title} className="card">
                  <div className="cardTitle">{e.title}</div>
                  <ul className="smallList">
                    {e.examples.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="note">
              Consultant view: evidence isn’t paperwork — it reduces “we think we do this” risk and proves consistency.
            </div>
          </div>
        </div>

        {/* STACKED SECTION */}
        <div className="stack">
          <div className="panel">
            <div className="sectionTitle">How scoring works</div>

            <div className="copy">
              Resiliscore keeps scoring intentionally simple so it’s useful for decision-making (not just reporting).
            </div>

            <ul className="bullets">
              <li>Each question is scored 0–5.</li>
              <li>Domain score = average of its questions.</li>
              <li>Overall score = average of domain scores.</li>
              <li>Grade (A–E) is derived from overall score.</li>
            </ul>

            <div className="divider" />

            <div className="miniTitle">Grade bands</div>
            <div className="gradeTable">
              {GRADE_BANDS.map((g) => (
                <div key={g.grade} className="gradeRow">
                  <div className="gradeBadge">{g.grade}</div>
                  <div className="gradeRange">{g.range}</div>
                  <div>{g.meaning}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="sectionTitle">Framework mapping</div>

            <p className="copy">
              Resiliscore includes framework mapping so SMEs can translate improvements into a language that customers,
              auditors, insurers, and procurement teams recognise. It helps you show “reasonable steps” without needing a
              full-time compliance team.
            </p>

            <div className="mapGrid">
              <div className="mapCard">
                <div className="mapTitle">NIST CSF</div>
                <div className="mapText">
                  A widely used cyber framework organised around outcomes (Identify, Protect, Detect, Respond, Recover).
                  It helps explain <b>what</b> you’re improving and <b>why</b> it reduces risk.
                </div>
              </div>

              <div className="mapCard">
                <div className="mapTitle">ISO/IEC 27001 / 27002 themes</div>
                <div className="mapText">
                  ISO gives a control-oriented view (policies, access, operations, supplier controls, incident handling).
                  It helps show your controls are aligned to recognised good practice.
                </div>
              </div>

              <div className="mapCard">
                <div className="mapTitle">UK “reasonable steps” alignment</div>
                <div className="mapText">
                  Helps you evidence due diligence expectations in the UK environment — useful for customer assurance,
                  supplier onboarding, and demonstrating governance.
                </div>
              </div>
            </div>

            <p className="muted small" style={{ marginTop: 12 }}>
              Note: Resiliscore is not a certification. Mapping supports alignment and reporting — it does not replace
              formal audit or certification processes.
            </p>
          </div>

          <div className="panel">
            <div className="sectionTitle">What you get after the assessment</div>

            <p className="copy">
              You’ll receive a clear, board-friendly baseline and a practical improvement plan. The goal is to reduce
              disruption risk quickly, focus investment where it matters, and make it easier to answer customer and
              procurement security questions with confidence.
            </p>

            <ul className="bullets">
              <li><b>Overall score + grade</b> — a simple maturity baseline you can track over time.</li>
              <li><b>Radar + domain snapshot</b> — a clear visual of strengths vs weak points.</li>
              <li><b>Domain breakdown</b> — what each domain means, what your score implies, and what to do next.</li>
              <li><b>90-day action plan</b> — practical actions designed for SMEs (owners + evidence focus).</li>
              <li><b>Shareable PDF report</b> — useful for internal buy-in and external assurance conversations.</li>
            </ul>

            <div className="note">
              Best practice: treat this as a working plan. Pick owners, set dates, and retake quarterly to show progress.
            </div>
          </div>

          <div className="panel">
            <div className="sectionTitle">Limitations</div>
            <ul className="bullets">
              <li>Indicative maturity snapshot based on responses.</li>
              <li>Not a penetration test, forensic review, or formal audit.</li>
              <li>Scores improve fastest when actions have owners, dates, and evidence (not just intent).</li>
              <li>Use results to prioritise: lift the weakest domains first to remove single points of failure.</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .wrap { margin-top: 20px; display: grid; gap: 20px; }

        .panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          box-shadow: var(--shadow);
        }

        .hero { padding: 28px; }

        .head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }

        .title { margin: 6px 0 0; font-size: 28px; }
        .sub { margin-top: 10px; color: var(--muted); max-width: 70ch; line-height: 1.6; }

        .muted { color: var(--muted); }
        .small { font-size: 13px; }

        .actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          color: var(--text);
          text-decoration: none;
          font-weight: 700;
        }
        .btn:hover { background: rgba(255,255,255,0.06); }
        .btn.ghost { background: transparent; }
        .btn.primary { background: rgba(94,234,106,0.12); border-color: rgba(94,234,106,0.25); }

        .tileGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .tileWide { grid-column: 1 / -1; }

        @media (max-width: 900px) {
          .tileGrid { grid-template-columns: 1fr; }
        }

        .sectionTitle { font-weight: 900; font-size: 16px; margin-bottom: 12px; }
        .miniTitle { font-weight: 800; margin-bottom: 10px; }

        .copy { color: var(--text); line-height: 1.65; margin-top: -2px; margin-bottom: 10px; }

        .bullets { padding-left: 18px; line-height: 1.7; }
        .bullets li { margin: 6px 0; }

        .divider { height: 1px; background: var(--border); margin: 18px 0; }

        .domainGrid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 900px) {
          .domainGrid { grid-template-columns: 1fr; }
        }

        .domainCard {
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px;
          background: rgba(255,255,255,0.02);
        }
        .domainShort { font-weight: 800; }
        .domainFull { font-size: 13px; }

        .evidenceGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 900px) {
          .evidenceGrid { grid-template-columns: 1fr; }
        }
        .card {
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px;
          background: rgba(255,255,255,0.02);
        }
        .cardTitle { font-weight: 900; margin-bottom: 8px; }
        .smallList { margin: 0; padding-left: 18px; line-height: 1.55; }
        .smallList li { margin: 6px 0; }

        .note {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          line-height: 1.6;
        }

        .gradeTable { display: grid; gap: 10px; }
        .gradeRow {
          display: grid;
          grid-template-columns: 48px 120px 1fr;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
        }
        .gradeBadge {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-weight: 900;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
        }
        .gradeRange { font-weight: 800; color: var(--muted); }

        /* Framework mapping cards */
        .mapGrid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-top: 12px;
        }
        @media (max-width: 900px) {
          .mapGrid { grid-template-columns: 1fr; }
        }
        .mapCard {
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px;
          background: rgba(255,255,255,0.02);
        }
        .mapTitle { font-weight: 900; margin-bottom: 6px; }
        .mapText { line-height: 1.6; color: var(--text); }
      `}</style>
    </main>
  );
}