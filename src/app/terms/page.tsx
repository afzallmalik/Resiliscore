import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="lt-shell">
      <section className="lt-hero">
        <div className="lt-kicker">Legal</div>
        <h1>Terms of Use</h1>
        <p className="lt-lead">
          Resiliscore is an indicative cyber resilience maturity assessment for SMEs. It helps you prioritise
          improvements — it is not a certification, audit, or compliance attestation.
        </p>

        <div className="lt-actions">
          <Link className="lt-btn lt-btnSecondary" href="/">
            Home
          </Link>
          <Link className="lt-btn lt-btnPrimary" href="/assessment">
            Start free assessment
          </Link>
        </div>
      </section>

      <section className="lt-lightSection">
        <div className="lt-gridTwo">
          <div className="lt-card">
            <h2>What you receive</h2>
            <ul className="lt-list">
              <li>An overall maturity score using a 0–5 scale.</li>
              <li>Domain-level breakdown and risk highlights.</li>
              <li>A results dashboard summarising your resilience posture.</li>
              <li>An optional premium PDF report available after completion.</li>
            </ul>
          </div>

          <div className="lt-card">
            <h2>What this service is not</h2>
            <ul className="lt-list">
              <li>Not a penetration test or vulnerability scan.</li>
              <li>Not a formal compliance certification.</li>
              <li>Not legal, insurance, or regulatory advice.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="lt-darkSection">
        <div className="lt-sectionHead">
          <div className="lt-sectionEyebrow">Responsibility</div>
          <h2>Accuracy and responsibility</h2>
          <p>
            Results depend on the accuracy of the responses submitted. Resiliscore should be used as a
            prioritisation and planning tool, not as the sole basis for business or security decisions.
          </p>
        </div>

        <div className="lt-darkCard">
          <p className="lt-darkText">
            If answers are incomplete or inaccurate, the resulting maturity score may not reflect your actual
            security posture. The service is designed to support structured improvement, not replace specialist
            judgement, technical testing, or formal assurance.
          </p>
        </div>
      </section>

      <section className="lt-lightSection">
        <div className="lt-gridTwo">
          <div className="lt-card">
            <h2>Acceptable use</h2>
            <ul className="lt-list">
              <li>Do not attempt to disrupt or overload the service.</li>
              <li>Do not attempt to reverse engineer or exploit the platform.</li>
              <li>Use the service only for legitimate organisational assessment and improvement.</li>
            </ul>
          </div>

          <div className="lt-card">
            <h2>Liability</h2>
            <p>
              To the maximum extent permitted by law, Resiliscore is provided “as is” without guarantees of
              completeness, accuracy, or suitability for a specific purpose. We are not liable for losses arising
              from reliance on the assessment results.
            </p>
          </div>
        </div>
      </section>

      <section className="lt-lightSection">
        <div className="lt-gridTwo">
          <div className="lt-card lt-cardAccent">
            <h2>Contact</h2>
            <p>
              For support or legal enquiries: <b>support@resiliscore.co.uk</b>
            </p>
          </div>

          <div className="lt-card">
            <h2>Governing law</h2>
            <p>These terms are governed by the laws of England and Wales.</p>
          </div>
        </div>
      </section>

      <style>{`
        .lt-shell {
          display: grid;
          gap: 20px;
        }

        .lt-hero,
        .lt-darkSection {
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            radial-gradient(560px 260px at 0% 0%, rgba(13,177,123,0.14), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
        }

        .lt-kicker,
        .lt-sectionEyebrow {
          color: rgba(141,240,203,0.95);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .lt-hero h1,
        .lt-sectionHead h2 {
          margin: 8px 0 0;
          color: rgba(255,255,255,0.96);
          font-size: 38px;
          line-height: 1.08;
          letter-spacing: -0.02em;
        }

        .lt-lead,
        .lt-sectionHead p {
          margin: 12px 0 0;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          max-width: 74ch;
        }

        .lt-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lt-btn {
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

        .lt-btn:hover {
          transform: translateY(-1px);
        }

        .lt-btnPrimary {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 8px 20px rgba(13,177,123,0.22);
        }

        .lt-btnPrimary:hover {
          background: var(--primary-dark);
        }

        .lt-btnSecondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.94);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .lt-btnSecondary:hover {
          background: rgba(255,255,255,0.10);
        }

        .lt-lightSection {
          border-radius: 24px;
          padding: 24px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 10px 28px rgba(3,16,22,0.08);
        }

        .lt-gridTwo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .lt-card {
          border-radius: 18px;
          padding: 18px;
          background: #fbfcfd;
          border: 1px solid rgba(6,27,34,0.08);
        }

        .lt-cardAccent {
          background: rgba(13,177,123,0.07);
          border-color: rgba(13,177,123,0.18);
        }

        .lt-card h2 {
          margin: 0 0 10px;
          color: #061b22;
          font-size: 22px;
          line-height: 1.2;
        }

        .lt-card p,
        .lt-list {
          margin: 0;
          color: rgba(6,27,34,0.78);
          line-height: 1.7;
        }

        .lt-list {
          padding-left: 18px;
        }

        .lt-list li + li {
          margin-top: 8px;
        }

        .lt-darkCard {
          margin-top: 16px;
          border-radius: 18px;
          padding: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .lt-darkText {
          margin: 0;
          color: rgba(255,255,255,0.78);
          line-height: 1.75;
        }

        @media (max-width: 900px) {
          .lt-gridTwo {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .lt-hero,
          .lt-darkSection,
          .lt-lightSection {
            padding: 18px;
          }

          .lt-hero h1,
          .lt-sectionHead h2 {
            font-size: 30px;
          }
        }
      `}</style>
    </main>
  );
}