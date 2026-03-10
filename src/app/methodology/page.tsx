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
    <main className="md-shell">
      <section className="md-hero">
        <div className="md-heroCopy">
          <div className="md-kicker">Resiliscore Methodology</div>
          <h1>How your score is calculated</h1>
          <p className="md-lead">
            A practical 0–5 maturity model designed for SMEs. It measures whether controls exist,
            operate consistently, and can be evidenced.
          </p>
        </div>

        <div className="md-actions">
          <Link className="md-btn md-btnPrimary" href="/assessment">
            Start free assessment
          </Link>
          <Link className="md-btn md-btnSecondary" href="/">
            Back to home
          </Link>
        </div>
      </section>

      <section className="md-lightSection">
        <div className="md-gridTwo">
          <div className="md-card">
            <div className="md-sectionTitle">What Resiliscore measures</div>
            <ul className="md-list">
              <li>
                <b>Controls</b> — the right safeguards exist.
              </li>
              <li>
                <b>Consistency</b> — they operate reliably day-to-day, not just on paper.
              </li>
              <li>
                <b>Evidence</b> — you can prove it quickly if asked with logs, actions, policies or tests.
              </li>
            </ul>
          </div>

          <div className="md-card">
            <div className="md-sectionTitle">How to answer</div>
            <ul className="md-list">
              <li>Score what is true <b>today</b>.</li>
              <li>If uneven across teams, score lower.</li>
              <li>When unsure, choose the lower score.</li>
              <li>Think: could I evidence this quickly?</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="md-darkSection">
        <div className="md-sectionHead">
          <div className="md-sectionEyebrow">Domains covered</div>
          <h2>The resilience areas Resiliscore focuses on</h2>
          <p>
            Resiliscore focuses on the areas that most often cause disruption for SMEs — operations, access,
            recovery, suppliers and response.
          </p>
        </div>

        <div className="md-domainGrid">
          {DOMAINS_V13.map((d) => (
            <div key={d.code} className="md-domainCard">
              <div className="md-domainShort">{d.short}</div>
              <div className="md-domainFull">{d.code}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="md-lightSection">
        <div className="md-sectionHead md-sectionHeadLight">
          <div className="md-sectionEyebrow">Evidence checklist</div>
          <h2>What good evidence usually looks like</h2>
          <p>
            You do not need perfect documentation. You need clear ownership and simple evidence you can find quickly.
          </p>
        </div>

        <div className="md-evidenceGrid">
          {EVIDENCE.map((e) => (
            <div key={e.title} className="md-card">
              <div className="md-cardTitle">{e.title}</div>
              <ul className="md-smallList">
                {e.examples.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="md-note">
          Consultant view: evidence is not paperwork for its own sake — it reduces “we think we do this”
          risk and proves consistency.
        </div>
      </section>

      <section className="md-lightSection">
        <div className="md-sectionHead md-sectionHeadLight">
          <div className="md-sectionEyebrow">Scoring model</div>
          <h2>How scoring works</h2>
          <p>
            Resiliscore keeps scoring intentionally simple so it is useful for decision-making, not just reporting.
          </p>
        </div>

        <div className="md-gridTwo">
          <div className="md-card">
            <div className="md-cardTitle">Scoring model</div>
            <ul className="md-list">
              <li>Each question is scored 0–5.</li>
              <li>Domain score = average of its questions.</li>
              <li>Overall score = average of domain scores.</li>
              <li>Grade (A–E) is derived from overall score.</li>
            </ul>
          </div>

          <div className="md-card">
            <div className="md-cardTitle">Grade bands</div>
            <div className="md-gradeTable">
              {GRADE_BANDS.map((g) => (
                <div key={g.grade} className="md-gradeRow">
                  <div className="md-gradeBadge">{g.grade}</div>
                  <div className="md-gradeRange">{g.range}</div>
                  <div className="md-gradeMeaning">{g.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="md-darkSection">
        <div className="md-sectionHead">
          <div className="md-sectionEyebrow">Framework mapping</div>
          <h2>Why the mapping exists</h2>
          <p>
            Resiliscore includes framework mapping so SMEs can translate improvements into language customers,
            auditors, insurers and procurement teams recognise.
          </p>
        </div>

        <div className="md-mapGrid">
          <div className="md-mapCard">
            <div className="md-mapTitle">NIST CSF</div>
            <div className="md-mapText">
              A widely used cyber framework organised around outcomes such as Identify, Protect, Detect,
              Respond and Recover. It helps explain what you are improving and why it reduces risk.
            </div>
          </div>

          <div className="md-mapCard">
            <div className="md-mapTitle">ISO/IEC 27001 / 27002 themes</div>
            <div className="md-mapText">
              ISO gives a control-oriented view across policies, access, operations, supplier controls and
              incident handling. It helps show your controls align to recognised good practice.
            </div>
          </div>

          <div className="md-mapCard">
            <div className="md-mapTitle">UK reasonable steps alignment</div>
            <div className="md-mapText">
              Helps you evidence due diligence expectations in the UK environment and supports customer
              assurance, supplier onboarding and governance conversations.
            </div>
          </div>
        </div>

        <div className="md-footNote">
          Note: Resiliscore is not a certification. Mapping supports alignment and reporting — it does not
          replace formal audit or certification processes.
        </div>
      </section>

      <section className="md-lightSection">
        <div className="md-sectionHead md-sectionHeadLight">
          <div className="md-sectionEyebrow">Outputs</div>
          <h2>What you get after the assessment</h2>
          <p>
            You receive a clear, board-friendly baseline and a practical improvement plan designed to reduce
            disruption risk quickly.
          </p>
        </div>

        <div className="md-card">
          <ul className="md-list">
            <li><b>Overall score + grade</b> — a simple maturity baseline you can track over time.</li>
            <li><b>Radar + domain snapshot</b> — a visual view of strengths versus weak points.</li>
            <li><b>Domain breakdown</b> — what each domain means, what your score implies, and what to do next.</li>
            <li><b>90-day action plan</b> — practical SME-friendly actions with owners and evidence focus.</li>
            <li><b>Shareable PDF report</b> — useful for internal buy-in and external assurance discussions.</li>
          </ul>
        </div>

        <div className="md-note">
          Best practice: treat this as a working plan. Pick owners, set dates, and retake quarterly to show progress.
        </div>
      </section>

      <section className="md-lightSection">
        <div className="md-sectionHead md-sectionHeadLight">
          <div className="md-sectionEyebrow">Limitations</div>
          <h2>What this does not replace</h2>
        </div>

        <div className="md-card">
          <ul className="md-list">
            <li>Indicative maturity snapshot based on responses.</li>
            <li>Not a penetration test, forensic review, or formal audit.</li>
            <li>Scores improve fastest when actions have owners, dates and evidence, not just intent.</li>
            <li>Use results to prioritise: lift the weakest domains first to remove single points of failure.</li>
          </ul>
        </div>
      </section>

      <style>{`
        .md-shell {
          display: grid;
          gap: 20px;
        }

        .md-hero,
        .md-darkSection {
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            radial-gradient(560px 260px at 0% 0%, rgba(13,177,123,0.14), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
        }

        .md-hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          flex-wrap: wrap;
        }

        .md-kicker,
        .md-sectionEyebrow {
          color: rgba(141,240,203,0.95);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .md-hero h1,
        .md-sectionHead h2 {
          margin: 8px 0 0;
          color: rgba(255,255,255,0.96);
          font-size: 38px;
          line-height: 1.08;
          letter-spacing: -0.02em;
        }

        .md-lead,
        .md-sectionHead p {
          margin: 12px 0 0;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          max-width: 72ch;
        }

        .md-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .md-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 800;
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .md-btn:hover {
          transform: translateY(-1px);
        }

        .md-btnPrimary {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 8px 20px rgba(13,177,123,0.22);
        }

        .md-btnPrimary:hover {
          background: var(--primary-dark);
        }

        .md-btnSecondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.94);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .md-btnSecondary:hover {
          background: rgba(255,255,255,0.10);
        }

        .md-lightSection {
          border-radius: 24px;
          padding: 24px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 10px 28px rgba(3,16,22,0.08);
        }

        .md-sectionHeadLight h2 {
          color: #061b22;
        }

        .md-sectionHeadLight p,
        .md-sectionHeadLight .md-sectionEyebrow {
          color: rgba(6,27,34,0.72);
        }

        .md-gridTwo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .md-card {
          border-radius: 18px;
          padding: 18px;
          background: #fbfcfd;
          border: 1px solid rgba(6,27,34,0.08);
        }

        .md-sectionTitle,
        .md-cardTitle {
          color: #061b22;
          font-size: 18px;
          font-weight: 850;
          margin-bottom: 10px;
        }

        .md-list,
        .md-smallList {
          margin: 0;
          padding-left: 18px;
          color: rgba(6,27,34,0.78);
          line-height: 1.7;
        }

        .md-list li + li,
        .md-smallList li + li {
          margin-top: 8px;
        }

        .md-domainGrid,
        .md-evidenceGrid,
        .md-mapGrid {
          margin-top: 18px;
          display: grid;
          gap: 14px;
        }

        .md-domainGrid {
          grid-template-columns: repeat(3, 1fr);
        }

        .md-evidenceGrid {
          grid-template-columns: 1fr 1fr;
        }

        .md-mapGrid {
          grid-template-columns: repeat(3, 1fr);
        }

        .md-domainCard,
        .md-mapCard {
          border-radius: 18px;
          padding: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .md-domainShort,
        .md-mapTitle {
          color: rgba(255,255,255,0.95);
          font-weight: 850;
          font-size: 17px;
        }

        .md-domainFull,
        .md-mapText,
        .md-footNote {
          margin-top: 6px;
          color: rgba(255,255,255,0.72);
          line-height: 1.65;
        }

        .md-note {
          margin-top: 16px;
          border-radius: 16px;
          padding: 14px 16px;
          background: rgba(13,177,123,0.08);
          border: 1px solid rgba(13,177,123,0.16);
          color: rgba(6,27,34,0.82);
          line-height: 1.65;
        }

        .md-gradeTable {
          display: grid;
          gap: 10px;
        }

        .md-gradeRow {
          display: grid;
          grid-template-columns: 48px 120px 1fr;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(6,27,34,0.08);
          background: #ffffff;
        }

        .md-gradeBadge {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(13,177,123,0.10);
          color: #0a8d62;
          font-weight: 900;
        }

        .md-gradeRange {
          color: rgba(6,27,34,0.65);
          font-weight: 800;
        }

        .md-gradeMeaning {
          color: rgba(6,27,34,0.82);
        }

        @media (max-width: 900px) {
          .md-gridTwo,
          .md-domainGrid,
          .md-evidenceGrid,
          .md-mapGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .md-hero,
          .md-darkSection,
          .md-lightSection {
            padding: 18px;
          }

          .md-hero h1,
          .md-sectionHead h2 {
            font-size: 30px;
          }

          .md-gradeRow {
            grid-template-columns: 48px 1fr;
          }

          .md-gradeMeaning {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </main>
  );
}