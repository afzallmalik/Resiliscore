import Link from "next/link";

export default function AboutPage() {
  return (
    <main>
      <h1>About Resiliscore</h1>
      <p className="lead">
        Resiliscore exists to make cyber resilience practical for SMEs — clear scoring, plain English, and a
        realistic path to improvement.
      </p>

      {/* MISSION */}
      <div className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Our mission</h2>
          <p className="muted">
            SMEs are often expected to “be secure” without having time, budget, or specialist teams.
            Resiliscore is built to help you quickly understand where you are today — and what to do next.
          </p>

          <div className="list">
            <div className="bullet">
              <span className="dot" />
              <div>
                <div className="b-title">Plain English</div>
                <div className="muted">No consultancy jargon. Clear, simple language.</div>
              </div>
            </div>

            <div className="bullet">
              <span className="dot" />
              <div>
                <div className="b-title">Practical outcomes</div>
                <div className="muted">Focus on habits and controls that reduce disruption.</div>
              </div>
            </div>

            <div className="bullet">
              <span className="dot" />
              <div>
                <div className="b-title">Maturity, not perfection</div>
                <div className="muted">A realistic scale that helps you improve steadily.</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }} className="row gap">
            <Link className="btn-primary" href="/assessment">
              Start Free Assessment
            </Link>
            <Link className="btn-secondary" href="/methodology">
              Read Methodology
            </Link>
          </div>
        </div>

        {/* WHAT WE BELIEVE */}
        <div className="card">
          <h2>What we believe</h2>
          <div className="beliefs">
            <div className="belief">
              <div className="belief-title">Security should be explainable.</div>
              <div className="muted">
                If you can’t explain a risk and a control simply, it won’t be adopted or maintained.
              </div>
            </div>

            <div className="belief">
              <div className="belief-title">Resilience is operational.</div>
              <div className="muted">
                Cyber incidents become operational problems quickly — planning for recovery matters.
              </div>
            </div>

            <div className="belief">
              <div className="belief-title">Consistency beats intensity.</div>
              <div className="muted">
                Simple controls, done consistently, outperform complex controls that aren’t maintained.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW WE THINK */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>How Resiliscore is designed</h2>
        <p className="muted">
          Resiliscore is designed around real-world SME constraints: limited time, limited resources, and
          reliance on suppliers and key systems. The assessment is structured to give you a clear baseline
          and an actionable improvement path.
        </p>

        <div className="grid two" style={{ marginTop: 10 }}>
          <div className="card soft">
            <div className="b-title">Structured domains</div>
            <div className="muted">
              Domains are grouped in a way that reflects how SMEs actually operate: governance, operations,
              incident readiness, recovery, suppliers, and people.
            </div>
          </div>

          <div className="card soft">
            <div className="b-title">CMMI maturity scale</div>
            <div className="muted">
              You score maturity from 0–5. This supports steady improvement and avoids “checkbox compliance”.
            </div>
          </div>

          <div className="card soft">
            <div className="b-title">Repeatable baseline</div>
            <div className="muted">
              Run the assessment periodically to track progress and focus on what moves the needle.
            </div>
          </div>

          <div className="card soft">
            <div className="b-title">Evidence-friendly</div>
            <div className="muted">
              Over time, you can back up answers with simple evidence — screenshots, policies, logs, or notes.
            </div>
          </div>
        </div>
      </div>

      {/* TRUST & ETHOS */}
      <div className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Privacy & trust</h2>
          <p className="muted">
            We take trust seriously. Resiliscore is designed to be useful without collecting unnecessary
            personal data.
          </p>

          <ul className="muted list">
            <li>We only collect what’s needed to run and improve the service.</li>
            <li>Your report is for you — share it only if you choose to.</li>
            <li>See our Privacy page for full details.</li>
          </ul>

          <div style={{ marginTop: 12 }}>
            <Link className="btn-secondary" href="/privacy">
              Read Privacy
            </Link>
          </div>
        </div>

        <div className="card">
          <h2>Where we’re going</h2>
          <p className="muted">
            Today, Resiliscore is a strong MVP: a structured assessment, clear scoring, and a downloadable
            report. Next we’ll improve the depth of explanations and recommendations.
          </p>

          <div className="timeline">
            <div className="t-item">
              <div className="t-dot" />
              <div>
                <div className="b-title">Now</div>
                <div className="muted">Professional UX, clear methodology, solid scoring.</div>
              </div>
            </div>
            <div className="t-item">
              <div className="t-dot" />
              <div>
                <div className="b-title">Next</div>
                <div className="muted">Better interpretations, stronger results dashboard, clearer actions.</div>
              </div>
            </div>
            <div className="t-item">
              <div className="t-dot" />
              <div>
                <div className="b-title">Later</div>
                <div className="muted">Premium reporting + evidence packs + optional advisory support.</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 16 }} className="row gap">
            <Link className="btn-primary" href="/assessment">
              Start Free Assessment
            </Link>
            <Link className="btn-secondary" href="/resources">
              SME Resources
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .lead { color: var(--text-muted); font-size: 16px; line-height: 1.6; max-width: 78ch; }
        .b-title { font-weight: 600; margin-bottom: 6px; }
        .soft { background: rgba(255,255,255,0.02); }
        .list { margin: 0; padding-left: 18px; line-height: 1.65; }
        .row.gap { display: flex; gap: 12px; flex-wrap: wrap; }

        .list, .beliefs { margin-top: 12px; }
        .beliefs { display: grid; gap: 14px; }
        .belief-title { font-weight: 600; margin-bottom: 6px; }

        .bullet { display: grid; grid-template-columns: 12px 1fr; gap: 12px; align-items: start; margin-top: 12px; }
        .dot { width: 10px; height: 10px; border-radius: 999px; background: var(--accent); margin-top: 4px; }

        .timeline { display: grid; gap: 14px; margin-top: 12px; }
        .t-item { display: grid; grid-template-columns: 12px 1fr; gap: 12px; align-items: start; }
        .t-dot { width: 10px; height: 10px; border-radius: 999px; background: var(--accent); margin-top: 4px; }
      `}</style>
    </main>
  );
}