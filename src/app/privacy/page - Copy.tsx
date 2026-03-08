import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main style={{ marginTop: 28 }}>
      <div className="pageHeader">
        <div className="kicker">Privacy</div>
        <h1>Privacy Policy</h1>
        <p className="lead">
          We keep this simple: we only collect what we need to run the assessment, generate your results, and provide your report.
        </p>
        <div className="actions">
          <Link className="btn" href="/">Home</Link>
          <Link className="btn primary" href="/assessment">Start assessment</Link>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>What we collect</h2>
          <ul className="list">
            <li><b>Your answers</b> to the assessment questions (scores only).</li>
            <li><b>Assessment details</b> such as your assessment ID, timestamps, score outputs, domain scores, and grade.</li>
            <li><b>Your email address</b>, which is required to start the assessment.</li>
            <li><b>Your company name</b>, if you choose to provide it.</li>
            <li><b>Your industry selection</b>, so results can be grouped and interpreted appropriately.</li>
          </ul>
        </div>

        <div className="card">
          <h2>What we don’t collect</h2>
          <ul className="list">
            <li>No payment card details are stored by Resiliscore.</li>
            <li>No marketing profile building.</li>
            <li>No selling your personal data.</li>
          </ul>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>How we use your data</h2>
          <ul className="list">
            <li>To calculate your maturity score and domain breakdown.</li>
            <li>To generate your results page and downloadable PDF report.</li>
            <li>To operate, maintain, and improve the service.</li>
            <li>To review aggregated or non-identifying product insights where appropriate.</li>
          </ul>
        </div>

        <div className="card">
          <h2>Legal basis</h2>
          <p className="muted">
            We process assessment data to provide the service you request, and to support service improvement where this is
            legitimate and proportionate.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Retention</h2>
        <p className="muted">
          We keep assessment records for as long as needed to provide access to your results and report, support service
          operation, and maintain reasonable business records. Retention periods may be refined over time as the product matures.
        </p>
      </div>

      <div className="grid two" style={{ marginTop: 18 }}>
        <div className="card">
          <h2>Cookies</h2>
          <p className="muted">
            We may use essential cookies or similar technologies for basic site functionality and session reliability. We do not
            use cookies for advertising-based tracking.
          </p>
        </div>

        <div className="card">
          <h2>Your rights</h2>
          <p className="muted">
            You can request access to, correction of, or deletion of your assessment data. The easiest way to help us locate
            your record is to provide your assessment ID or the email address used to start the assessment.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h2>Contact</h2>
        <p className="muted">
          For privacy-related requests, contact: <b>privacy@resiliscore.co.uk</b>
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
        .lead { color: var(--muted); max-width: 70ch; }
        .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
        .list { margin: 0; padding-left: 18px; color: var(--muted); }
        .list li { margin: 10px 0; }
      `}</style>
    </main>
  );
}