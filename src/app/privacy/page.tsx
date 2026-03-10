import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="lp-shell">
      <section className="lp-hero">
        <div className="lp-kicker">Privacy</div>
        <h1>Privacy Policy</h1>
        <p className="lp-lead">
          We keep this simple: we only collect what we need to run the assessment, generate your results,
          and provide your report.
        </p>

        <div className="lp-actions">
          <Link className="lp-btn lp-btnSecondary" href="/">
            Home
          </Link>
          <Link className="lp-btn lp-btnPrimary" href="/assessment">
            Start free assessment
          </Link>
        </div>
      </section>

      <section className="lp-lightSection">
        <div className="lp-card">
          <h2>Data controller</h2>
          <p>Resiliscore Ltd is the data controller for this service.</p>
        </div>
      </section>

      <section className="lp-lightSection">
        <div className="lp-gridTwo">
          <div className="lp-card">
            <h2>What we collect</h2>
            <ul className="lp-list">
              <li><b>Your answers</b> to the assessment questions.</li>
              <li><b>Assessment details</b> such as assessment ID, timestamps, score outputs, domain scores, and grade.</li>
              <li><b>Your email address</b>, which is required to start the assessment.</li>
              <li><b>Your company name</b>, if you choose to provide it.</li>
              <li><b>Your industry selection</b>, so results can be grouped and interpreted appropriately.</li>
            </ul>
          </div>

          <div className="lp-card">
            <h2>What we don’t collect</h2>
            <ul className="lp-list">
              <li>No payment card details are stored by Resiliscore.</li>
              <li>No marketing profile building.</li>
              <li>No selling your personal data.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="lp-darkSection">
        <div className="lp-sectionHead">
          <div className="lp-sectionEyebrow">Use of data</div>
          <h2>How we use your data</h2>
          <p>
            Assessment data is used to calculate your score, generate your report, operate the service, and
            support reasonable product improvement.
          </p>
        </div>

        <div className="lp-gridTwo">
          <div className="lp-darkCard">
            <h3>How we use your data</h3>
            <ul className="lp-darkList">
              <li>To calculate your maturity score and domain breakdown.</li>
              <li>To generate your results page and downloadable PDF report.</li>
              <li>To operate, maintain, and improve the service.</li>
              <li>To review aggregated or non-identifying product insights where appropriate.</li>
            </ul>
          </div>

          <div className="lp-darkCard">
            <h3>Legal basis</h3>
            <p>
              We process assessment data to provide the service you request, and to support service improvement
              where this is legitimate and proportionate.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-lightSection">
        <div className="lp-gridTwo">
          <div className="lp-card">
            <h2>Retention</h2>
            <p>
              We keep assessment records for as long as needed to provide access to your results and report,
              support service operation, and maintain reasonable business records.
            </p>
          </div>

          <div className="lp-card">
            <h2>Cookies</h2>
            <p>
              We may use essential cookies or similar technologies for basic site functionality and session
              reliability. We do not use cookies for advertising-based tracking.
            </p>
          </div>
        </div>
      </section>

      <section className="lp-lightSection">
        <div className="lp-gridTwo">
          <div className="lp-card">
            <h2>Your rights</h2>
            <p>
              You can request access to, correction of, or deletion of your assessment data. The easiest way
              to help us locate your record is to provide your assessment ID or the email address used to start
              the assessment.
            </p>
          </div>

          <div className="lp-card lp-cardAccent">
            <h2>Contact</h2>
            <p>
              For privacy-related requests, contact: <b>support@resiliscore.co.uk</b>
            </p>
          </div>
        </div>
      </section>

      <style>{`
        .lp-shell {
          display: grid;
          gap: 20px;
        }

        .lp-hero,
        .lp-darkSection {
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            radial-gradient(560px 260px at 0% 0%, rgba(13,177,123,0.14), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
        }

        .lp-kicker,
        .lp-sectionEyebrow {
          color: rgba(141,240,203,0.95);
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .lp-hero h1,
        .lp-sectionHead h2 {
          margin: 8px 0 0;
          color: rgba(255,255,255,0.96);
          font-size: 38px;
          line-height: 1.08;
          letter-spacing: -0.02em;
        }

        .lp-lead,
        .lp-sectionHead p {
          margin: 12px 0 0;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          max-width: 72ch;
        }

        .lp-actions {
          margin-top: 16px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lp-btn {
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

        .lp-btn:hover {
          transform: translateY(-1px);
        }

        .lp-btnPrimary {
          background: var(--primary);
          color: #fff;
          box-shadow: 0 8px 20px rgba(13,177,123,0.22);
        }

        .lp-btnPrimary:hover {
          background: var(--primary-dark);
        }

        .lp-btnSecondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.94);
          border: 1px solid rgba(255,255,255,0.14);
        }

        .lp-btnSecondary:hover {
          background: rgba(255,255,255,0.10);
        }

        .lp-lightSection {
          border-radius: 24px;
          padding: 24px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 10px 28px rgba(3,16,22,0.08);
        }

        .lp-gridTwo {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .lp-card {
          border-radius: 18px;
          padding: 18px;
          background: #fbfcfd;
          border: 1px solid rgba(6,27,34,0.08);
        }

        .lp-cardAccent {
          background: rgba(13,177,123,0.07);
          border-color: rgba(13,177,123,0.18);
        }

        .lp-card h2,
        .lp-darkCard h3 {
          margin: 0 0 10px;
          color: #061b22;
          font-size: 22px;
          line-height: 1.2;
        }

        .lp-card p,
        .lp-list {
          margin: 0;
          color: rgba(6,27,34,0.78);
          line-height: 1.7;
        }

        .lp-list {
          padding-left: 18px;
        }

        .lp-list li + li {
          margin-top: 8px;
        }

        .lp-darkCard {
          border-radius: 18px;
          padding: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
        }

        .lp-darkCard h3 {
          color: rgba(255,255,255,0.95);
          margin-bottom: 10px;
        }

        .lp-darkCard p,
        .lp-darkList {
          color: rgba(255,255,255,0.78);
          line-height: 1.7;
          margin: 0;
        }

        .lp-darkList {
          padding-left: 18px;
        }

        .lp-darkList li + li {
          margin-top: 8px;
        }

        @media (max-width: 900px) {
          .lp-gridTwo {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .lp-hero,
          .lp-darkSection,
          .lp-lightSection {
            padding: 18px;
          }

          .lp-hero h1,
          .lp-sectionHead h2 {
            font-size: 30px;
          }
        }
      `}</style>
    </main>
  );
}