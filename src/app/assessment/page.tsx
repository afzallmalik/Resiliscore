import AssessmentForm from "./ui";

export default function AssessmentPage() {
  return (
    <main style={{ marginTop: 20 }}>
      <div className="pageHeader">
        <div className="kicker">Assessment</div>
        <h1>Cyber resilience maturity check</h1>
        <p className="lead">
          Score each item using the 0–5 maturity scale. Keep answers honest and practical — this is a baseline, not an audit.
        </p>
      </div>

      <div className="panel scoringPanel">
        <div className="sectionTitle">How scoring works</div>
        <p className="muted intro">
          Each question is scored from 0–5 based on how mature and repeatable the control is today.
        </p>

        <ul className="bullets compactBullets">
          <li><b>0 – Not in place:</b> No evidence, reactive.</li>
          <li><b>1 – Ad hoc:</b> Informal, inconsistent.</li>
          <li><b>2 – Repeatable:</b> Basic routine exists.</li>
          <li><b>3 – Defined:</b> Documented and followed.</li>
          <li><b>4 – Managed:</b> Owned, measured, evidenced.</li>
          <li><b>5 – Optimised:</b> Continuously improved and tested.</li>
        </ul>

        <div className="note compactNote">
          Tip: If unsure, choose the lower score. The assessment reflects what is true today.
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <AssessmentForm />
      </div>

      <style>{`
        .pageHeader {
          display: grid;
          gap: 8px;
          margin-bottom: 14px;
        }

        .kicker {
          display: inline-block;
          width: fit-content;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--muted);
          font-size: 12px;
        }

        .lead {
          color: var(--muted);
          max-width: 72ch;
          margin: 0;
        }

        .scoringPanel {
          padding: 16px 18px;
        }

        .intro {
          margin-bottom: 10px;
          max-width: 72ch;
        }

        .compactBullets {
          margin: 0;
          padding-left: 18px;
        }

        .compactBullets li {
          margin-bottom: 6px;
        }

        .compactNote {
          margin-top: 10px;
        }
      `}</style>
    </main>
  );
}