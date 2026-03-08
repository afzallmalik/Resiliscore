import Link from "next/link";

export default function TermsPage() {
  return (
    <main style={{ marginTop: 28 }}>
      <div className="pageHeader">
        <div className="kicker">Legal</div>
        <h1>Terms of Use</h1>
        <p className="lead">
          Resiliscore is an indicative cyber resilience maturity assessment for SMEs. It helps you prioritise improvements — it is not
          a certification, audit, or compliance attestation.
        </p>
        <div className="actions">
          <Link className="btn" href="/">Home</Link>
          <Link className="btn primary" href="/assessment">Start assessment</Link>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>What you receive</h2>
          <ul className="list">
            <li>An overall maturity score using a 0–5 scale.</li>
            <li>Domain-level breakdown and risk highlights.</li>
            <li>A results dashboard summarising your resilience posture.</li>
            <li>An optional premium PDF report available after completion.</li>
          </ul>
        </div>

        <div className="card">
          <h2>What this service is not</h2>
          <ul className="list">
            <li>Not a penetration test or vulnerability scan.</li>
            <li>Not a formal compliance certification.</li>
            <li>Not legal, insurance, or regulatory advice.</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Accuracy and responsibility</h2>
        <p className="muted">
          Results depend on the accuracy of the responses submitted. If answers are incomplete or inaccurate, the resulting
          maturity score may not reflect your actual security posture. Resiliscore should be used as a prioritisation and
          planning tool, not as the sole basis for business or security decisions.
        </p>
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>Acceptable use</h2>
          <ul className="list">
            <li>Do not attempt to disrupt or overload the service.</li>
            <li>Do not attempt to reverse engineer or exploit the platform.</li>
            <li>Use the service only for legitimate organisational assessment and improvement.</li>
          </ul>
        </div>

        <div className="card">
          <h2>Liability</h2>
          <p className="muted">
            To the maximum extent permitted by law, Resiliscore is provided “as is” without guarantees of completeness,
            accuracy, or suitability for a specific purpose. We are not liable for losses arising from reliance on the
            assessment results. Nothing in these terms limits liability where it cannot be excluded under applicable law.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Contact</h2>
        <p className="muted">
          For support or legal enquiries: <b>support@resiliscore.co.uk</b>
        </p>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Governing law</h2>
        <p className="muted">
          These terms are governed by the laws of England and Wales.
        </p>
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
        .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
        .list { margin: 0; padding-left: 18px; color: var(--muted); }
        .list li { margin: 10px 0; }
      `}</style>
    </main>
  );
}