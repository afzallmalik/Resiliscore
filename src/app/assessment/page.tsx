import AssessmentForm from "./ui";

export default function AssessmentPage() {
  return (
    <main className="assessmentPageShell">
      <section className="assessmentIntroHero">
        <div className="assessmentIntroKicker">Assessment</div>

        <h1>Cyber resilience maturity check</h1>

        <p className="assessmentIntroLead">
          Score each item using the 0–5 maturity scale. Keep answers honest and practical — this is a baseline, not an audit.
        </p>

        <div className="assessmentIntroGrid">
          <div className="assessmentIntroCard">
            <div className="assessmentIntroCardTitle">How scoring works</div>
            <p>
              Each question is scored from 0–5 based on how mature and repeatable the control is today.
            </p>
            <ul>
              <li><b>0 – Not in place:</b> No evidence, reactive.</li>
              <li><b>1 – Ad hoc:</b> Informal, inconsistent.</li>
              <li><b>2 – Repeatable:</b> Basic routine exists.</li>
              <li><b>3 – Defined:</b> Documented and followed.</li>
              <li><b>4 – Managed:</b> Owned, measured, evidenced.</li>
              <li><b>5 – Optimised:</b> Continuously improved and tested.</li>
            </ul>
          </div>

          <div className="assessmentIntroCard assessmentIntroCardAccent">
            <div className="assessmentIntroCardTitle">Scoring tip</div>
            <p>
              If unsure, choose the lower score. The assessment reflects what is true today, not what is planned.
            </p>
          </div>
        </div>
      </section>

      <section className="assessmentFormWrap">
        <AssessmentForm />
      </section>

      <style>{`
        .assessmentPageShell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 20px 16px 36px;
          display: grid;
          gap: 18px;
        }

        .assessmentIntroHero {
          border-radius: 28px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.10);
          background:
            radial-gradient(560px 260px at 0% 0%, rgba(13,177,123,0.16), transparent 60%),
            radial-gradient(700px 320px at 100% 0%, rgba(255,255,255,0.06), transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03));
        }

        .assessmentIntroKicker {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.88);
          font-size: 13px;
          font-weight: 800;
        }

        .assessmentIntroHero h1 {
          margin: 16px 0 0;
          color: rgba(255,255,255,0.96);
          font-size: 44px;
          line-height: 1.04;
          letter-spacing: -0.03em;
        }

        .assessmentIntroLead {
          margin: 14px 0 0;
          color: rgba(255,255,255,0.72);
          max-width: 72ch;
          line-height: 1.7;
        }

        .assessmentIntroGrid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 16px;
        }

        .assessmentIntroCard {
          border-radius: 20px;
          padding: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .assessmentIntroCardAccent {
          background: rgba(13,177,123,0.12);
          border-color: rgba(13,177,123,0.24);
        }

        .assessmentIntroCardTitle {
          color: rgba(255,255,255,0.95);
          font-size: 17px;
          font-weight: 850;
        }

        .assessmentIntroCard p {
          margin: 10px 0 0;
          color: rgba(255,255,255,0.74);
          line-height: 1.65;
        }

        .assessmentIntroCard ul {
          margin: 12px 0 0;
          padding-left: 18px;
          color: rgba(255,255,255,0.84);
          line-height: 1.6;
        }

        .assessmentIntroCard li + li {
          margin-top: 6px;
        }

        .assessmentFormWrap {
          display: block;
        }

        @media (max-width: 900px) {
          .assessmentIntroGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .assessmentPageShell {
            padding: 14px 12px 28px;
          }

          .assessmentIntroHero {
            padding: 18px;
          }

          .assessmentIntroHero h1 {
            font-size: 36px;
          }
        }
      `}</style>
    </main>
  );
}