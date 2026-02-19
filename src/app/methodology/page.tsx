export default function Methodology() {
  return (
    <main>
      <h1>Methodology</h1>
      <div className="card">
        <h3>Domains (v1)</h3>
        <ol>
          <li>Governance</li>
          <li>Technical Security</li>
          <li>Operational Security</li>
          <li>Asset &amp; Data Protection</li>
          <li>Vendor &amp; Third-Party Risk</li>
          <li>Culture &amp; Awareness</li>
          <li>Human Risk &amp; Behaviour</li>
          <li>Resilience &amp; Recovery</li>
        </ol>

        <h3>Scoring</h3>
        <p>Each question is scored on a 0–5 maturity scale:</p>
        <p className="muted">0 Non-existent • 1 Initial • 2 Repeatable • 3 Defined • 4 Managed • 5 Optimised</p>
        <p>Domain score = average of 12 questions in the domain. Overall score = average of 8 domain scores.</p>

        <h3>Grade bands</h3>
        <p className="muted">A 4.5–5.0 • B 3.5–4.4 • C 2.5–3.4 • D 1.5–2.4 • E 0–1.4</p>
      </div>
    </main>
  );
}
