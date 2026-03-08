import Link from "next/link";

export default function ResourcesPage() {
  return (
    <main>
      <h1>SME Resources</h1>
      <p className="lead">
        Practical guidance for SMEs. No jargon. This page explains the “why” behind the assessment and what
        good looks like in real life.
      </p>

      {/* QUICK START */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Quick start (the 10 essentials)</h2>
        <p className="muted">
          If you do nothing else, focus here. These are the biggest risk-reducers for most SMEs.
        </p>

        <div className="grid two" style={{ marginTop: 10 }}>
          <div className="card soft">
            <div className="b-title">1) Multi-factor authentication (MFA)</div>
            <div className="muted">Turn on MFA for email, admin accounts, and remote access.</div>
          </div>
          <div className="card soft">
            <div className="b-title">2) Backups you can restore</div>
            <div className="muted">Backups are only real if you test restores.</div>
          </div>
          <div className="card soft">
            <div className="b-title">3) Patch critical systems fast</div>
            <div className="muted">Set a target for critical updates and track it.</div>
          </div>
          <div className="card soft">
            <div className="b-title">4) Remove unnecessary admin access</div>
            <div className="muted">Review who has powerful access and reduce it.</div>
          </div>
          <div className="card soft">
            <div className="b-title">5) Secure your email</div>
            <div className="muted">Most attacks start with email. Lock it down.</div>
          </div>
          <div className="card soft">
            <div className="b-title">6) Basic incident plan</div>
            <div className="muted">Who does what, who to call, what systems matter.</div>
          </div>
          <div className="card soft">
            <div className="b-title">7) Know your critical services</div>
            <div className="muted">What must keep running? Write it down.</div>
          </div>
          <div className="card soft">
            <div className="b-title">8) Supplier awareness</div>
            <div className="muted">Know which suppliers could stop your business.</div>
          </div>
          <div className="card soft">
            <div className="b-title">9) Train staff simply</div>
            <div className="muted">Teach reporting, phishing basics, and safe handling.</div>
          </div>
          <div className="card soft">
            <div className="b-title">10) Monitor the basics</div>
            <div className="muted">Logs, alerts, and someone checking them regularly.</div>
          </div>
        </div>
      </div>

      {/* WHAT GOOD LOOKS LIKE */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>What “good” looks like (plain English)</h2>
        <div className="grid two" style={{ marginTop: 10 }}>
          <div className="card soft">
            <div className="b-title">Governance</div>
            <ul className="muted list">
              <li>A named owner for cyber resilience (not just “IT”).</li>
              <li>Leadership reviews risks and actions regularly.</li>
              <li>Decisions are recorded (accept / fix / reduce).</li>
            </ul>
          </div>

          <div className="card soft">
            <div className="b-title">Operations</div>
            <ul className="muted list">
              <li>Patching is tracked (especially critical systems).</li>
              <li>Backups run, are monitored, and restore tests are done.</li>
              <li>Access is controlled and reviewed (especially admins).</li>
            </ul>
          </div>

          <div className="card soft">
            <div className="b-title">Incident readiness</div>
            <ul className="muted list">
              <li>A simple plan exists and people know where it is.</li>
              <li>You’ve run a tabletop exercise in the last 12 months.</li>
              <li>Lessons learned turn into improvements.</li>
            </ul>
          </div>

          <div className="card soft">
            <div className="b-title">Recovery & continuity</div>
            <ul className="muted list">
              <li>Critical services are identified and prioritised.</li>
              <li>Recovery targets are agreed (how quickly you need to be back).</li>
              <li>Dependencies are known (suppliers, systems, key people).</li>
            </ul>
          </div>

          <div className="card soft">
            <div className="b-title">Suppliers</div>
            <ul className="muted list">
              <li>Critical suppliers are identified.</li>
              <li>Contracts include basic security expectations.</li>
              <li>Suppliers are reviewed periodically, not just at onboarding.</li>
            </ul>
          </div>

          <div className="card soft">
            <div className="b-title">People & culture</div>
            <ul className="muted list">
              <li>Staff can easily report suspicious activity.</li>
              <li>Training is short, relevant, and repeated.</li>
              <li>Security is part of onboarding for new starters.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FRAMEWORKS, WITHOUT THE FLUFF */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Frameworks (without the fluff)</h2>
        <p className="muted">
          You don’t need to become an expert in frameworks. The point is to build consistent habits that
          reduce disruption. Resiliscore is structured around outcomes commonly seen across established
          approaches.
        </p>

        <div className="grid two" style={{ marginTop: 10 }}>
          <div className="card soft">
            <div className="b-title">If you’re starting from scratch</div>
            <div className="muted">
              Focus on basics and repeatable controls. Resilience grows through consistency.
            </div>
          </div>

          <div className="card soft">
            <div className="b-title">If you’re more mature</div>
            <div className="muted">
              Focus on testing, measurement, supplier assurance, and continuous improvement.
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2>FAQ</h2>

        <div className="faq">
          <div className="q">How often should we run Resiliscore?</div>
          <div className="muted">Every 3–6 months, or after major changes or incidents.</div>

          <div className="q">Do we need evidence for every answer?</div>
          <div className="muted">
            Not for the first run. Over time, aim to back up key controls with basic evidence (policy,
            screenshots, logs, meeting notes).
          </div>

          <div className="q">Is this a compliance certificate?</div>
          <div className="muted">
            No. It’s a maturity assessment designed to be explainable and useful for improvement.
          </div>

          <div className="q">What’s the best first improvement for most SMEs?</div>
          <div className="muted">
            MFA for email/admin + tested backups. Those two alone prevent many painful incidents.
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

      <style>{`
        .lead { color: var(--text-muted); font-size: 16px; line-height: 1.6; max-width: 75ch; }
        .b-title { font-weight: 600; margin-bottom: 8px; }
        .soft { background: rgba(255,255,255,0.02); }
        .list { margin: 0; padding-left: 18px; line-height: 1.65; }
        .faq { display: grid; gap: 10px; margin-top: 10px; }
        .q { font-weight: 600; margin-top: 10px; }
        .row.gap { display: flex; gap: 12px; flex-wrap: wrap; }
      `}</style>
    </main>
  );
}