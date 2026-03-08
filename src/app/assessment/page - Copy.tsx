import AssessmentForm from "./ui";

export default function AssessmentPage() {
  return (
    <main style={{ marginTop: 28 }}>
      <div className="pageHeader">
        <div className="kicker">Assessment</div>
        <h1>Cyber resilience maturity check</h1>
        <p className="lead">
          Score each item using the CMMI 0–5 scale. Aim for honesty and consistency — it’s a baseline, not an audit.
        </p>
      </div>

<div className="panel">
  <div className="sectionTitle">Before you start: How scoring works</div>
  <p className="muted" style={{ marginBottom: 12 }}>
    Each question is scored from 0–5 based on maturity.
  </p>

  <ul className="bullets">
    <li><b>0 – Not in place:</b> No evidence, reactive.</li>
    <li><b>1 – Ad hoc:</b> Informal, inconsistent.</li>
    <li><b>2 – Repeatable:</b> Basic routine exists.</li>
    <li><b>3 – Defined:</b> Documented and followed.</li>
    <li><b>4 – Managed:</b> Owned, measured, evidenced.</li>
    <li><b>5 – Optimised:</b> Continuously improved and tested.</li>
  </ul>

  <div className="note">
    Tip: If unsure, choose the lower score. The assessment reflects what is true today.
  </div>
</div>

      <div style={{ marginTop: 16 }}>
        <AssessmentForm />
      </div>

      <style>{`
        .pageHeader { display: grid; gap: 10px; }
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
        .lead { color: var(--muted); max-width: 75ch; }
      `}</style>
    </main>
  );
}