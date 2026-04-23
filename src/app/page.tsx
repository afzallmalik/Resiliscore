"use client";

import Link from "next/link";

const problemPoints = [
  "Security is inconsistent across the business",
  "No clear view of where resilience is weakest",
  "No prioritised plan for what to fix first",
  "Little evidence if something goes wrong",
];

const whatYouGet = [
  "A clear resilience score",
  "A prioritised 90-day action plan",
  "Evidence checklist for each control",
  "Executive-ready summary and PDF report",
];

const steps = [
  {
    number: "01",
    title: "Answer a short assessment",
    text: "Complete a structured SME-focused assessment covering governance, access, operations, response, recovery, and suppliers.",
  },
  {
    number: "02",
    title: "See where you actually stand",
    text: "Get a clear view of where resilience is weakest, what is inconsistent, and what is most likely to break under pressure.",
  },
  {
    number: "03",
    title: "Act on a clear plan",
    text: "Use the report, checklist, and prioritised 90-day plan to improve resilience without guesswork.",
  },
];

const whoItsFor = [
  {
    title: "SME owners",
    text: "For business owners who need a clearer view of risk before it turns into disruption.",
  },
  {
    title: "Operational leaders",
    text: "For people responsible for keeping the business running when pressure appears.",
  },
  {
    title: "Non-technical decision makers",
    text: "For teams who need practical clarity, not cyber jargon or enterprise complexity.",
  },
];

export default function HomePage() {
  return (
    <main className="homePage">
      <section className="heroWrap rsHeroWrap">
        <div className="heroBackdrop rsHeroBackdrop" />
        <div className="heroOverlay rsHeroOverlay" />

        <div className="homeShell heroShell">
          <div className="rsHeroGrid">
            <div className="rsHeroCopy">
              <div className="heroEyebrow">Cyber resilience clarity for SMEs</div>

              <h1 className="rsHeroTitle">
                Most SMEs think they’re covered.
                <br />
                The real risk is what breaks under pressure.
              </h1>

              <p className="rsHeroLead">
                Resiliscore shows where you actually stand — and gives you a
                clear, prioritised 90-day plan.
              </p>

              <div className="heroActions">
                <Link href="/assessment" className="btn btnPrimary">
                  Start your assessment
                </Link>
                <Link
                  href="/sample-report.pdf"
                  className="btn btnSecondary"
                  target="_blank"
                >
                  View sample report
                </Link>
              </div>

              <div className="rsHeroMeta">
                <span>Built for SMEs</span>
                <span>No subscription</span>
                <span>One-time report</span>
              </div>
            </div>

            <div className="rsHeroCard">
              <div className="rsHeroCardLabel">Why businesses use it</div>
              <h2>
                Use Resiliscore before a client, insurer, supplier, or real
                incident exposes the gap.
              </h2>
              <p>
                It is a practical resilience report designed to help smaller
                businesses understand what is inconsistent, what cannot yet be
                proven, and what to fix first.
              </p>

              <div className="rsHeroMiniPoints">
                <div className="rsHeroMiniPoint">Clear score</div>
                <div className="rsHeroMiniPoint">Priority gaps</div>
                <div className="rsHeroMiniPoint">90-day plan</div>
                <div className="rsHeroMiniPoint">Executive-ready PDF</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="homeShell siteSections rsLandingSections">
        <section className="sectionCard sectionCardLight">
          <div className="rsSectionGrid">
            <div className="sectionHeading">
              <div className="sectionEyebrow">The problem</div>
              <h2>The gap isn’t what you know. It’s what’s missing.</h2>
              <p>
                Most SMEs do not lack tools. They lack visibility over what is
                inconsistent, weak, or unproven when the business is under
                pressure.
              </p>
            </div>

            <div className="rsBulletCard">
              {problemPoints.map((item) => (
                <div key={item} className="rsBulletItem">
                  <span className="rsBulletDot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="rsSectionGrid rsSectionGridReverse">
            <div className="sectionHeading">
              <div className="sectionEyebrow">What you get</div>
              <h2>A report built to be clear, practical, and usable.</h2>
              <p>
                Resiliscore is designed to help you understand what matters
                first, without enterprise software or over-explaining.
              </p>

              <div className="rsBulletCard rsBulletCardInline">
                {whatYouGet.map((item) => (
                  <div key={item} className="rsBulletItem">
                    <span className="rsBulletDot" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rsImagePanel">
              <div className="rsImageFrame rsImageFrameReport">
                <div className="rsImageOverlay" />
                <img
                  src="/hero-circuit.png"
                  alt="Resiliscore report and cyber resilience visual"
                  className="rsSectionImage"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="sectionCard sectionCardDark">
          <div className="rsSectionGrid rsSectionGridCenter">
            <div className="sectionHeading sectionHeadingDark">
              <div className="sectionEyebrow">Sample report</div>
              <h2>See the structure before you commit.</h2>
              <p>
                Review the sample report to see the tone, layout, priorities,
                and level of clarity before taking the assessment.
              </p>
            </div>

            <div className="samplePanel rsSamplePanel">
              <div>
                <div className="samplePanelLabel">Preview</div>
                <h3>Executive-ready. Plain English. No technical fluff.</h3>
                <p>
                  Built to be useful for leadership, internal planning,
                  insurers, clients, and external conversations.
                </p>
              </div>

              <div className="samplePanelActions">
                <Link
                  href="/sample-report.pdf"
                  className="btn btnGhost"
                  target="_blank"
                >
                  Open sample PDF
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="rsSectionGrid rsSectionGridReverse">
            <div className="sectionHeading">
              <div className="sectionEyebrow">How it works</div>
              <h2>A simple path from assessment to action.</h2>
            </div>

            <div className="rsImagePanel">
              <div className="rsImageFrame rsImageFrameTall">
                <div className="rsImageOverlay rsImageOverlaySoft" />
                <img
                  src="/hero-office.png"
                  alt="SME team reviewing plans around a table"
                  className="rsSectionImage"
                />
              </div>
            </div>
          </div>

          <div className="stepsGrid rsStepsGrid">
            {steps.map((step) => (
              <article key={step.number} className="stepCard">
                <div className="stepNumber">{step.number}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="rsSectionGrid">
            <div className="sectionHeading">
              <div className="sectionEyebrow">Who it’s for</div>
              <h2>Built for smaller businesses that need clarity, not jargon.</h2>
              <p>
                Resiliscore is designed for SMEs that want a practical view of
                resilience before spending more heavily on audits, consultants,
                or larger cyber programmes.
              </p>
            </div>

            <div className="trustGrid rsTrustGrid">
              {whoItsFor.map((item) => (
                <article key={item.title} className="trustCard">
                  <div className="trustLabel">{item.title}</div>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sectionCard sectionCardDark ctaSection rsFinalCta">
          <div>
            <div className="sectionEyebrow">Final step</div>
            <h2>
              You do not need more cyber jargon.
              <br />
              You need to know whether what you already have would actually hold
              up under pressure.
            </h2>
          </div>

          <div className="ctaActions">
            <Link href="/assessment" className="btn btnPrimary">
              Start your assessment
            </Link>
            <Link href="/methodology" className="btn btnGhost">
              Read methodology
            </Link>
          </div>
        </section>
      </div>

      <style jsx>{`
        .rsHeroWrap {
          padding: 56px 0 48px;
        }

        .rsHeroBackdrop {
          background-image: url("/hero-landing.png");
          background-size: cover;
          background-position: center;
          opacity: 0.34;
          transform: scale(1.03);
        }

        .rsHeroOverlay {
          background:
            linear-gradient(180deg, rgba(4, 10, 24, 0.52) 0%, rgba(4, 10, 24, 0.74) 100%),
            radial-gradient(900px 420px at 15% 10%, rgba(26, 115, 232, 0.18), transparent 58%),
            radial-gradient(700px 360px at 85% 20%, rgba(52, 211, 235, 0.12), transparent 60%);
        }

        .rsHeroGrid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 28px;
          align-items: stretch;
          min-height: calc(100vh - 190px);
          padding: 44px 0 28px;
        }

        .rsHeroCopy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 700px;
        }

        .rsHeroTitle {
          margin: 18px 0 0;
          color: var(--text-on-dark);
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: clamp(3rem, 5.6vw, 5.2rem);
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .rsHeroLead {
          margin: 20px 0 0;
          max-width: 34rem;
          color: var(--muted-on-dark);
          font-size: 18px;
          line-height: 1.7;
        }

        .rsHeroMeta {
          margin-top: 18px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 13px;
        }

        .rsHeroMeta span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
        }

        .rsHeroCard {
          align-self: end;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(180deg, rgba(8, 14, 30, 0.8), rgba(11, 18, 36, 0.84));
          padding: 24px;
          box-shadow: var(--shadow-md);
          backdrop-filter: blur(14px);
        }

        .rsHeroCardLabel {
          color: rgba(255, 255, 255, 0.76);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rsHeroCard h2 {
          margin: 12px 0 0;
          color: var(--text-on-dark);
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: clamp(1.6rem, 2.4vw, 2.4rem);
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .rsHeroCard p {
          margin: 14px 0 0;
          color: var(--muted-on-dark);
          line-height: 1.7;
          font-size: 15px;
        }

        .rsHeroMiniPoints {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .rsHeroMiniPoint {
          border-radius: 12px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          font-weight: 600;
        }

        .rsLandingSections {
          gap: 32px;
          padding-bottom: 64px;
        }

        .rsSectionGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: center;
        }

        .rsSectionGridReverse .sectionHeading {
          order: 1;
        }

        .rsSectionGridReverse .rsImagePanel {
          order: 2;
        }

        .rsSectionGridCenter {
          grid-template-columns: 1fr;
        }

        .rsBulletCard {
          border-radius: var(--radius-lg);
          border: 1px solid rgba(15, 20, 40, 0.08);
          background: rgba(255, 255, 255, 0.92);
          padding: 20px;
          display: grid;
          gap: 14px;
          box-shadow: var(--shadow-sm);
        }

        .rsBulletCardInline {
          margin-top: 20px;
        }

        .rsBulletItem {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: var(--text-soft);
          line-height: 1.6;
          font-size: 16px;
        }

        .rsBulletDot {
          width: 9px;
          height: 9px;
          margin-top: 8px;
          border-radius: 999px;
          flex: 0 0 auto;
          background: linear-gradient(135deg, var(--cyan), var(--blue));
        }

        .rsImagePanel {
          display: flex;
          justify-content: center;
        }

        .rsImageFrame {
          position: relative;
          overflow: hidden;
          width: 100%;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(15, 20, 40, 0.08);
          box-shadow: var(--shadow-sm);
          background: #08111f;
          min-height: 340px;
        }

        .rsImageFrameReport {
          min-height: 360px;
        }

        .rsImageFrameTall {
          min-height: 320px;
        }

        .rsSectionImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rsImageOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(5, 10, 22, 0.16) 0%, rgba(5, 10, 22, 0.34) 100%);
          z-index: 1;
        }

        .rsImageOverlaySoft {
          background:
            linear-gradient(180deg, rgba(5, 10, 22, 0.12) 0%, rgba(5, 10, 22, 0.26) 100%);
        }

        .rsSamplePanel {
          margin-top: 6px;
        }

        .rsStepsGrid {
          margin-top: 24px;
        }

        .rsTrustGrid {
          margin-top: 0;
        }

        .rsFinalCta {
          align-items: center;
        }

        @media (max-width: 1080px) {
          .rsHeroGrid,
          .rsSectionGrid,
          .rsSectionGridReverse {
            grid-template-columns: 1fr;
          }

          .rsHeroGrid {
            min-height: auto;
          }

          .rsHeroCard {
            align-self: stretch;
          }

          .rsSectionGridReverse .sectionHeading,
          .rsSectionGridReverse .rsImagePanel {
            order: initial;
          }
        }

        @media (max-width: 840px) {
          .rsHeroWrap {
            padding: 28px 0 34px;
          }

          .rsHeroGrid {
            padding: 28px 0 18px;
            gap: 20px;
          }

          .rsHeroCard,
          .rsBulletCard {
            padding: 18px;
          }

          .rsHeroMiniPoints {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px) {
          .rsHeroTitle {
            font-size: 2.7rem;
          }

          .rsHeroLead {
            font-size: 16px;
          }

          .rsHeroMiniPoints {
            grid-template-columns: 1fr;
          }

          .rsBulletItem {
            font-size: 15px;
          }

          .rsImageFrame,
          .rsImageFrameReport,
          .rsImageFrameTall {
            min-height: 240px;
          }
        }
      `}</style>
    </main>
  );
}