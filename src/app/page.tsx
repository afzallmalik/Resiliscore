import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Resiliscore – Cyber Resilience Maturity Assessment (Free)</h1>
      <p className="muted">
        Resiliscore is a free, framework-aligned maturity diagnostic that helps organisations understand their cyber resilience
        across eight core domains.
      </p>

      <div className="grid two">
        <div className="card">
          <h3>What you get</h3>
          <ul>
            <li>Overall maturity score (0–5) and A–E grade</li>
            <li>Domain-by-domain breakdown</li>
            <li>Clear strengths and risk areas</li>
            <li>A practical 90-day improvement roadmap</li>
          </ul>
          <Link className="btn" href="/assessment">Start the free assessment</Link>
        </div>

        <div className="card">
          <h3>What it is (and isn’t)</h3>
          <p>
            Resiliscore provides maturity diagnostics and prioritisation. It is not a certification, compliance audit, or penetration test.
          </p>
          <p className="muted">
            Built for SMEs, supplier due diligence, baseline reviews, and leadership teams needing a clear risk view.
          </p>
          <Link className="btn secondary" href="/methodology">View methodology</Link>
        </div>
      </div>
    </main>
  );
}
