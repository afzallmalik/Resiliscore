import Link from "next/link";
import { DOMAINS_V13 } from "@/lib/domains";

export const dynamic = "force-dynamic";

const EVIDENCE = [
  {
    title: "Access & accounts",
    examples: [
      "MFA enabled on email and key systems",
      "Leaver access removed quickly",
      "Admin accounts reviewed",
      "Strong password or sign-in controls in place",
    ],
  },
  {
    title: "Backups & recovery",
    examples: [
      "Backups running successfully",
      "Restore test completed",
      "Critical systems identified",
      "Simple recovery steps written down",
    ],
  },
  {
    title: "Day-to-day security",
    examples: [
      "Devices updated regularly",
      "Known issues tracked and fixed",
      "Suspicious emails reported",
      "Key supplier access reviewed",
    ],
  },
  {
    title: "Ownership & proof",
    examples: [
      "Named owner for cyber risk",
      "Simple risk list",
      "Leadership review notes",
      "Incident or lessons-learned log",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <main className="md-shell">
      <section className="md-hero">
        <div className="md-heroCopy">
          <div className="md-kicker">How Resiliscore works</div>
          <h1>How your report is created</h1>
          <p className="md-lead">
            Resiliscore uses a structured assessment to show where your business is most exposed,
            how a breach could happen, what it could cost, and what to fix first.
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
            <div className="md-sectionTitle">What Resiliscore looks at</div>
            <ul className="md-list">
              <li>
                <b>Weak points</b> — where your business is most exposed to avoidable disruption.
              </li>
              <li>
                <b>Consistency</b> — whether key protections happen reliably, not just occasionally.
              </li>
              <li>
                <b>Proof</b> — whether you could show a client, insurer, or partner that the basics are in place.
              </li>
            </ul>
          </div>

          <div className="md-card">
            <div className="md-sectionTitle">How to answer</div>
            <ul className="md-list">
              <li>Answer based on what is true <b>today</b>.</li>
              <li>If something is only partly in place, score it lower.</li>
              <li>If different teams do things differently, answer for the overall business.</li>
              <li>Think: could we prove this quickly if someone asked?</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="md-darkSection">
        <div className="md-sectionHead">
          <div className="md-sectionEyebrow">Areas covered</div>
          <h2>The business risk areas Resiliscore reviews</h2>
          <p>
            Resiliscore focuses on the areas that most often create disruption for small and medium-sized
            businesses — access, recovery, daily security routines, suppliers, and response.
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
          <div className="md-sectionEyebrow">How the report is built</div>
          <h2>What happens after you complete the assessment</h2>
          <p>
            Your answers are used to turn technical risk into a simple business report that is easier to act on.
          </p>
        </div>

        <div className="md-gridTwo">
          <div className="md-card">
            <div className="md-cardTitle">How results are created</div>
            <ul className="md-list">
              <li>Each answer contributes to a score across key business risk areas.</li>
              <li>We identify the weakest areas that are most likely to cause disruption first.</li>
              <li>Those weaker areas are translated into likely breach routes and practical priorities.</li>
              <li>The final report focuses on risk, impact, and what to do next.</li>
            </ul>
          </div>

          <div className="md-card">
            <div className="md-cardTitle">What you receive</div>
            <ul className="md-list">
              <li><b>Business risk summary</b> — your main weaknesses in plain English.</li>
              <li><b>Likely breach routes</b> — how a problem is most likely to happen.</li>
              <li><b>Estimated impact range</b> — what disruption could cost your business.</li>
              <li><b>Top 5 actions</b> — what to fix in the next 90 days.</li>
              <li><b>Benchmark and checklist</b> — how you compare and what you can show others.</li>
            </ul>
          </div>
        </div>

        <div className="md-note">
          The goal is not to create a technical audit. The goal is to give a business owner a report they can
          understand quickly and use immediately.
        </div>
      </section>

      <section className="md-lightSection">
        <div className="md-sectionHead md-sectionHeadLight">
          <div className="md-sectionEyebrow">Evidence examples</div>
          <h2>What useful evidence usually looks like</h2>
          <p>
            You do not need perfect documentation. You need clear ownership and simple proof that the basics are actually happening.
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
          Good evidence reduces the risk of saying “we think we do this” when a client, insurer, or incident later proves otherwise.
        </div>
      </section>

      <section className="md-darkSection">
        <div className="md-sectionHead">
          <div className="md-sectionEyebrow">Frameworks in the background</div>
          <h2>Why frameworks still matter</h2>
          <p>
            Resiliscore uses recognised frameworks in the background to keep the assessment structured and credible,
            but the customer-facing report is designed to stay simple and business-focused.
          </p>
        </div>

        <div className="md-mapGrid">
          <div className="md-mapCard">
            <div className="md-mapTitle">NIST CSF</div>
            <div className="md-mapText">
              Helps structure cyber outcomes such as identifying weaknesses, protecting systems, responding to incidents,
              and recovering from disruption.
            </div>
          </div>

          <div className="md-mapCard">
            <div className="md-mapTitle">ISO / IEC 27001 themes</div>
            <div className="md-mapText">
              Provides recognised control themes across access, operations, suppliers, incident handling, and governance.
            </div>
          </div>

          <div className="md-mapCard">
            <div className="md-mapTitle">Practical business assurance</div>
            <div className="md-mapText">
              Supports clearer conversations with clients, insurers, procurement teams, and partners without making the main report feel compliance-heavy.
            </div>
          </div>
        </div>

        <div className="md-footNote">
          Resiliscore is not a certification. Frameworks help structure the assessment in the background, but the report is designed first and foremost as a practical business risk tool.
        </div>
      </section>

      <section className="md-lightSection">
        <div className="md-sectionHead md-sectionHeadLight">
          <div className="md-sectionEyebrow">Limits</div>
          <h2>What this does not replace</h2>
        </div>

        <div className="md-card">
          <ul className="md-list">
            <li>It is an indicative business risk report based on your responses.</li>
            <li>It does not replace a penetration test, forensic investigation, or formal external audit.</li>
            <li>It is designed to help you prioritise action, not create paperwork for its own sake.</li>
            <li>The biggest improvements usually come from fixing the weakest few areas first and reviewing progress regularly.</li>
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
        }
      `}</style>
    </main>
  );
}