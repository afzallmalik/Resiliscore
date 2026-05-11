"use client";

import { useMemo, useState } from "react";
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


const industryViews = [
  {
    label: "General SME",
    headline: "Most SMEs are exposed through inconsistent routines, not one dramatic failure.",
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

const whyNowPoints = [
  {
    title: "Harder questions are reaching smaller businesses",
    text: "Clients, insurers, suppliers, and procurement teams increasingly expect businesses to explain how they manage access, recovery, suppliers, evidence, and continuity.",
  },
  {
    title: "Most SMEs need a starting point, not more jargon",
    text: "Many businesses know resilience matters, but do not know where to begin, what is already working, or which weaknesses should be prioritised first.",
  },
  {
    title: "Resilience is becoming a leadership issue",
    text: "The risk is not just a technical incident. It is downtime, confusion, slow decisions, weak evidence, supplier disruption, and loss of confidence when pressure appears.",
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
                Most SMEs think they’re covered.
                <br />
                The real risk is what breaks under pressure.
              </h1>

              <p className="rsHeroLead">
                Resiliscore shows where your business is most likely to fail first,
                what that means commercially, and what to fix next.
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
                <span>Assessment + action guidance</span>
                <span>Executive-ready PDF</span>
              </div>
            </div>
          </div>        </div>
      </section>

      <div className="homeShell siteSections rsLandingSections">
        <section className="sectionCard sectionCardDark rsWhyNowSection">
          <div className="rsWhyNowHeader">
            <div className="sectionEyebrow">Why this matters now</div>
            <h2>SMEs are being asked to prove resilience before pressure exposes the gaps.</h2>
            <p>
              Resiliscore gives smaller businesses a practical starting point: insight,
              education, and prioritised direction before they spend more heavily on
              tools, audits, consultants, or larger cyber programmes.
            </p>
          </div>

          <div className="rsWhyNowGrid">
            {whyNowPoints.map((item) => (
              <article key={item.title} className="rsWhyNowCard">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="rsWhyNowNote">
            <span>UK resilience direction</span>
            <p>
              UK cyber guidance increasingly encourages practical steps, readiness, and
              confidence-building for smaller organisations. Resiliscore supports that
              direction by helping SMEs understand where they stand, what is weakest,
              and what to improve first — without claiming to be a certification,
              audit, or government-backed scheme.
            </p>
          </div>
        </section>

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

        <section className="sectionCard sectionCardLight rsIndustrySection">
          <div className="rsSectionGrid">
            <div className="sectionHeading">
              <div className="sectionEyebrow">Industry view</div>
              <h2>Why this assessment matters for your business type</h2>
              <p>
                Select an industry to see the kind of pressure Resiliscore is designed to make visible.
                The assessment stays simple, but the report helps translate resilience into practical business language.
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
              <div className="sectionEyebrow">Free insight report</div>
              <h2>AI is now part of the SME resilience picture.</h2>
              <p>
                Download the free Resiliscore insight report on AI and emerging
                technology risk. It explains where everyday AI usage creates new
                data, supplier, people, operational, and incident response risks
                for SMEs.
              </p>
            </div>

            <div className="samplePanel rsSamplePanel">
              <div>
                <div className="samplePanelLabel">AI & emerging technology risk</div>
                <h3>Plain-English guidance before the risk becomes invisible.</h3>
                <p>
                  A practical SME briefing covering common AI exposure, six AI
                  resilience questions, and a simple 30-day starting plan.
                </p>
              </div>

              <div className="samplePanelActions">
                <Link
                  href="/Resiliscore_AI_Emerging_Technology_Risk_Report_final.pdf"
                  className="btn btnGhost"
                  target="_blank"
                >
                  Download free report
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
          <div className="rsFinalCtaCopy">
            <div className="rsFinalCtaEyebrow">Final step</div>
            <h2 className="rsFinalCtaTitle">
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
          max-width: 700px;
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
          border: 1px solid rgba(34, 211, 238, 0.16);
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


        .rsWhyNowSection {
          display: grid;
          gap: 22px;
          background:
            radial-gradient(860px 340px at 0% 0%, rgba(34, 211, 238, 0.14), transparent 58%),
            radial-gradient(680px 320px at 100% 0%, rgba(14, 165, 164, 0.10), transparent 60%),
            linear-gradient(180deg, rgba(6, 27, 34, 0.97), rgba(5, 13, 22, 0.98));
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: var(--shadow-md);
        }

        .rsWhyNowHeader {
          max-width: 900px;
        }

        .rsWhyNowHeader h2 {
          margin: 12px 0 0;
          color: rgba(255, 255, 255, 0.98);
          font-family: Inter, sans-serif;
          font-weight: 300;
          font-size: clamp(2.05rem, 3.3vw, 3.35rem);
          line-height: 1.05;
          letter-spacing: -0.045em;
          max-width: 24ch;
        }

        .rsWhyNowHeader p {
          margin: 16px 0 0;
          max-width: 72ch;
          color: rgba(255, 255, 255, 0.72);
          font-size: 16px;
          line-height: 1.75;
        }

        .rsWhyNowGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .rsWhyNowCard {
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.055);
          padding: 18px;
        }

        .rsWhyNowCard h3 {
          margin: 0;
          color: rgba(255, 255, 255, 0.94);
          font-family: Inter, sans-serif;
          font-weight: 500;
          font-size: 1.05rem;
          line-height: 1.22;
          letter-spacing: -0.025em;
        }

        .rsWhyNowCard p {
          margin: 10px 0 0;
          color: rgba(255, 255, 255, 0.68);
          font-size: 14.5px;
          line-height: 1.7;
        }

        .rsWhyNowNote {
          border-radius: var(--radius-lg);
          border: 1px solid rgba(34, 211, 238, 0.18);
          background: rgba(34, 211, 238, 0.075);
          padding: 18px 20px;
        }

        .rsWhyNowNote span {
          display: inline-flex;
          color: rgba(34, 211, 238, 0.96);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rsWhyNowNote p {
          margin: 8px 0 0;
          color: rgba(255, 255, 255, 0.74);
          line-height: 1.72;
          font-size: 15px;
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
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: clamp(1.35rem, 2vw, 2rem);
          line-height: 1.15;
          letter-spacing: -0.025em;
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
          font-family: "Space Grotesk", Inter, sans-serif;
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.08;
          letter-spacing: -0.035em;
          max-width: 26ch;
        }

        @media (max-width: 1080px) {
          .rsSectionGrid,
          .rsSectionGridReverse,
          .rsWhyNowGrid {
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
            padding: 28px 0 18px;
          }

          .rsBulletCard,
          .rsWhyNowCard,
          .rsWhyNowNote {
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

          .rsFinalCtaTitle {
            font-size: 1.9rem;
            max-width: none;
          }
        }
      `}</style>
    </main>
  );
}