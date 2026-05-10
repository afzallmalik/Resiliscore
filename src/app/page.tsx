"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const problemPoints = [
  "Access, backups, suppliers, response, or ownership may fail under pressure",
  "Weaknesses are often concentrated in one or two avoidable areas",
  "Leaders need a clear plan before spending more on tools or consultancy",
  "Evidence is often missing when clients, insurers, or partners ask questions",
];

const whatYouGet = [
  "Executive-ready resilience summary",
  "Top 3 immediate actions to take now",
  "Prioritised 30 / 60 / 90 day improvement plan",
  "Practical implementation guidance",
  "Technology direction without vendor bias",
  "Provider Brief: what to ask your IT provider or MSP",
  "Evidence checklist for key controls",
  "Downloadable PDF report",
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
    text: "Use the report, checklist, provider brief, and prioritised 90-day plan to improve resilience without guesswork.",
  },
];


const industryViews = [
  {
    label: "General SME",
    headline: "Most SMEs do not fail everywhere. They fail in one or two weak areas.",
    text: "Resiliscore helps you see whether access, backups, suppliers, response, and ownership would hold up when the business is under pressure.",
  },
  {
    label: "Professional services",
    headline: "Client trust depends on confidentiality, continuity, and proof.",
    text: "For accountants, consultants, legal practices, agencies, and advisers, weak access controls, poor evidence, or slow response can damage client confidence quickly.",
  },
  {
    label: "Construction & property",
    headline: "Projects rely on people, suppliers, documents, and payment flows staying available.",
    text: "Resiliscore highlights weaknesses around supplier dependency, document access, finance systems, recovery, and operational continuity before they interrupt delivery.",
  },
  {
    label: "Retail & eCommerce",
    headline: "Downtime, payment disruption, account compromise, or supplier issues can hit revenue fast.",
    text: "The assessment helps identify whether your store, customer data, admin access, fulfilment dependencies, and recovery plans are resilient enough.",
  },
  {
    label: "Healthcare & clinics",
    headline: "Availability, confidentiality, and evidence matter when patient-facing services depend on systems.",
    text: "Resiliscore helps smaller healthcare providers understand whether access, sensitive data, supplier systems, and recovery routines are clearly controlled.",
  },
  {
    label: "Manufacturing & engineering",
    headline: "Operational disruption often starts with systems, suppliers, devices, or unmanaged change.",
    text: "The assessment focuses on the routines that keep production, files, supplier access, backups, and response activity controlled under pressure.",
  },
  {
    label: "Financial services",
    headline: "Evidence, access control, and supplier assurance are central to trust.",
    text: "Resiliscore gives a practical view of whether key controls are owned, repeatable, and provable when clients, insurers, or partners ask difficult questions.",
  },
  {
    label: "Education & training",
    headline: "Learning environments rely on access, data, platforms, and continuity working reliably.",
    text: "The assessment helps identify weaknesses around user access, cloud platforms, learner data, supplier dependency, and recovery planning.",
  },
  {
    label: "Hospitality & leisure",
    headline: "Bookings, payments, staff access, and supplier systems need to work when demand is high.",
    text: "Resiliscore highlights practical gaps that can create avoidable disruption in customer-facing operations.",
  },
  {
    label: "IT, SaaS & MSP",
    headline: "Your own resilience position affects customer confidence and delivery credibility.",
    text: "The report helps smaller technology providers evidence control maturity, prioritise weak areas, and explain resilience improvements clearly.",
  },
  {
    label: "Charity & non-profit",
    headline: "Limited resources make prioritisation and evidence even more important.",
    text: "Resiliscore helps charities focus on the controls most likely to protect operations, donor data, service continuity, and partner confidence.",
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
  const [selectedIndustry, setSelectedIndustry] = useState(industryViews[0].label);
  const selectedIndustryView = useMemo(
    () => industryViews.find((item) => item.label === selectedIndustry) ?? industryViews[0],
    [selectedIndustry]
  );

  return (
    <main className="homePage">
      <section className="heroWrap rsHeroWrap">
        <div className="heroBackdrop rsHeroBackdrop" />
        <div className="heroOverlay rsHeroOverlay" />

        <div className="homeShell heroShell">
          <div className="rsHeroSingle">
            <div className="rsHeroCopy">
              <div className="heroEyebrow">Cyber resilience clarity for SMEs</div>

              <h1 className="rsHeroTitle">
                Know where your business would fail first — and what to fix next.
              </h1>

              <p className="rsHeroLead">
                Resiliscore shows where your business is most likely to fail first,
                what that means commercially, and gives you a clear plan to fix it.
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
                <span>Assessment + action plan</span>
                <span>Provider-ready PDF</span>
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
              <h2>Most businesses don’t fail everywhere.</h2>
              <p>
                They fail in the weak areas nobody has tested, owned, evidenced,
                or discussed properly. Resiliscore turns those gaps into clear
                priorities.
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

        <section className="sectionCard sectionCardLight rsIndustrySection">
          <div className="rsSectionGrid">
            <div className="sectionHeading">
              <div className="sectionEyebrow">Industry view</div>
              <h2>Why this assessment matters for your business type</h2>
              <p>
                Select an industry to see where disruption typically starts and why this assessment matters.
                The assessment stays simple, but the report turns resilience gaps into practical business language.
              </p>
            </div>

            <div className="rsIndustryPanel">
              <label className="rsIndustryLabel" htmlFor="industry-view">
                Choose your industry
              </label>
              <select
                id="industry-view"
                className="rsIndustrySelect"
                value={selectedIndustry}
                onChange={(event) => setSelectedIndustry(event.target.value)}
              >
                {industryViews.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>

              <div className="rsIndustryResult">
                <div className="rsIndustrySelected">{selectedIndustryView.label}</div>
                <h3>{selectedIndustryView.headline}</h3>
                <p>{selectedIndustryView.text}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="rsSectionGrid rsSectionGridReverse">
            <div className="sectionHeading">
              <div className="sectionEyebrow">What you get</div>
              <h2>Not just a score — a practical action plan.</h2>
              <p>
                The results page gives immediate clarity. The full PDF adds the
                implementation guidance, evidence checklist, and provider brief
                needed to turn risk into action.
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
                Review the sample report to see the structure, priorities,
                implementation guidance, and provider-ready format before taking the assessment.
              </p>
            </div>

            <div className="samplePanel rsSamplePanel">
              <div>
                <div className="samplePanelLabel">Preview</div>
                <h3>Executive-ready. Plain English. Action-focused.</h3>
                <p>
                  Built to be useful for leadership, internal planning,
                  IT provider conversations, insurers, clients, and follow-up work.
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
                Resiliscore is designed for owner-led SMEs that want a practical view of
                resilience before spending more heavily on tools, audits, consultants,
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
          <div className="rsFinalCtaCopy">
            <div className="rsFinalCtaEyebrow">Final step</div>
            <h2 className="rsFinalCtaTitle">
              You do not need more cyber jargon.
              <br />
              You need to know what would break first — and what to fix next.
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
          padding: 44px 0 38px;
        }

        .rsHeroBackdrop {
          background-image: url("/hero-landing.png");
          background-size: cover;
          background-position: 74% center;
          opacity: 0.96;
          transform: scale(1.01);
        }

        .rsHeroOverlay {
          background:
            linear-gradient(
              90deg,
              rgba(3, 12, 18, 0.82) 0%,
              rgba(3, 12, 18, 0.52) 38%,
              rgba(3, 12, 18, 0.08) 100%
            ),

            linear-gradient(
              180deg,
              rgba(3, 12, 18, 0.10) 0%,
              rgba(3, 12, 18, 0.30) 100%
            ),

            radial-gradient(
              900px 420px at 16% 10%,
              rgba(34, 211, 238, 0.08),
              transparent 58%
            );
        }

        .rsHeroSingle {
          min-height: calc(100vh - 220px);
          display: flex;
          align-items: center;
          padding: 44px 0 28px;
        }

        .rsHeroCopy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 760px;
        }

        .rsHeroTitle {
          margin: 18px 0 0;

          color: rgba(255,255,255,0.96);

          font-family: Inter, sans-serif;
          font-weight: 300;

          font-size: clamp(3.1rem, 5vw, 5rem);

          line-height: 1.02;
          letter-spacing: -0.045em;

          max-width: 18ch;
        }

        .rsHeroLead {
          margin: 22px 0 0;
          max-width: 37rem;
          color: rgba(255, 255, 255, 0.74);
          font-size: 18px;
          line-height: 1.72;
        }

        .rsHeroMeta {
          margin-top: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          color: rgba(255, 255, 255, 0.78);
          font-size: 13px;
        }

        .rsHeroMeta span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(34, 211, 238, 0.14);
          border-radius: 999px;
        }

        .rsIndustrySection {
          overflow: visible;
        }

        .rsIndustryPanel {
          border-radius: var(--radius-lg);
          border: 1px solid rgba(15, 20, 40, 0.08);
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
          padding: 22px;
          box-shadow: var(--shadow-sm);
        }

        .rsIndustryLabel {
          display: block;
          margin-bottom: 8px;
          color: var(--text-soft);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .rsIndustrySelect {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(15, 20, 40, 0.12);
          background: #ffffff;
          color: var(--text-main);
          padding: 14px 14px;
          font-size: 15px;
          font-weight: 650;
          outline: none;
        }

        .rsIndustrySelect:focus {
          border-color: rgba(34, 211, 238, 0.62);
          box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.14);
        }

        .rsIndustryResult {
          margin-top: 18px;
          border-radius: 16px;
          background: rgba(6, 27, 34, 0.04);
          border: 1px solid rgba(6, 27, 34, 0.08);
          padding: 18px;
        }

        .rsIndustrySelected {
          color: var(--cyan);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rsIndustryResult h3 {
          margin: 10px 0 0;
          color: var(--text-main);
          font-family: Inter, sans-serif;
          font-weight: 500;
          font-size: clamp(1.3rem, 1.85vw, 1.85rem);
          line-height: 1.18;
          letter-spacing: -0.035em;
        }

        .rsIndustryResult p {
          margin: 12px 0 0;
          color: var(--text-soft);
          line-height: 1.7;
          font-size: 15px;
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
          background:
            radial-gradient(900px 320px at 0% 0%, rgba(34, 211, 238, 0.16), transparent 58%),
            radial-gradient(700px 320px at 100% 0%, rgba(6, 182, 212, 0.12), transparent 60%),
            linear-gradient(180deg, rgba(10, 16, 38, 0.98), rgba(4, 9, 28, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: var(--shadow-md);
        }

        .rsFinalCtaCopy {
          max-width: 820px;
        }

        .rsFinalCtaEyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(34, 211, 238, 0.95);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rsFinalCtaTitle {
          margin: 12px 0 0;
          color: rgba(255, 255, 255, 0.98);
          font-family: Inter, sans-serif;
          font-weight: 300;
          font-size: clamp(2.05rem, 3.4vw, 3.35rem);
          line-height: 1.04;
          letter-spacing: -0.045em;
          max-width: 27ch;
        }

        @media (max-width: 1080px) {
          .rsSectionGrid,
          .rsSectionGridReverse {
            grid-template-columns: 1fr;
          }

          .rsHeroSingle {
            min-height: auto;
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

          .rsHeroSingle {
            padding: 30px 0 18px;
          }

          .rsBulletCard {
            padding: 18px;
          }

          .rsHeroMiniPoints {
            grid-template-columns: 1fr 1fr;
          }
        }

	@media (max-width: 640px) {
  	.rsHeroTitle {
    	font-size: 2.25rem;
    	line-height: 1.05;
    	max-width: none;
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

          .rsFinalCtaTitle {
            font-size: 2rem;
            max-width: none;
          }
        }
      `}</style>
    </main>
  );
}