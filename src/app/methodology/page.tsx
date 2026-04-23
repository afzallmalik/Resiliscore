import Link from "next/link";

const methodologyPoints = [
  {
    title: "Built for SMEs, not enterprise security teams",
    text: "Resiliscore is designed for smaller businesses that need a practical view of resilience without technical jargon, consultancy-style over-explaining, or enterprise complexity.",
  },
  {
    title: "Focused on the resilience visibility gap",
    text: "The assessment is designed to expose the gap between what a business believes is in place and what it can actually demonstrate under pressure.",
  },
  {
    title: "Structured around real operational pressure points",
    text: "The report looks at the areas where disruption usually becomes visible first: ownership, access, operations, response, recovery, supplier dependency, and evidence.",
  },
];

const domains = [
  "Governance & Leadership",
  "Risk & Compliance",
  "Asset & Data Management",
  "Identity & Access Management",
  "Secure Operations",
  "Threat & Vulnerability Management",
  "Incident Detection & Response",
  "Resilience & Recovery",
  "Third-Party & Supply Chain",
];

const expectations = [
  "Where resilience is likely to be weaker than the business assumes",
  "Where disruption is most likely to begin if nothing changes",
  "What is probably happening operationally today",
  "What to fix first in practical, SME-friendly language",
  "How to turn the result into a clearer 30 / 60 / 90 day plan",
];

export default function MethodologyPage() {
  return (
    <main className="homePage">
      <div className="homeShell siteSections" style={{ paddingTop: 32 }}>
        <section className="sectionCard sectionCardLight">
          <div className="sectionHeading">
            <div className="sectionEyebrow">Methodology</div>
            <h2>How Resiliscore works for SMEs</h2>
            <p>
              Resiliscore is designed to give SMEs a practical view of cyber resilience. It is not a technical audit and not a compliance certificate. Its purpose is to show where resilience is most likely to fail under pressure, what is inconsistent, and what should be improved first.
            </p>
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="sectionHeading">
            <div className="sectionEyebrow">Core idea</div>
            <h2>The resilience visibility gap</h2>
            <p>
              Many businesses believe they are reasonably protected because they have tools,
              policies, backups, or an IT provider. The real issue is whether those controls
              are actually consistent, owned, and provable when pressure appears.
            </p>
            <p>
              Resiliscore is built to expose that gap: the difference between perceived
              resilience and provable resilience.
            </p>
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="sectionHeading">
            <div className="sectionEyebrow">What the assessment is based on</div>
            <h2>A practical resilience structure for smaller businesses</h2>
          </div>

          <div className="trustGrid">
            {methodologyPoints.map((item) => (
              <article key={item.title} className="trustCard">
                <div className="trustLabel">{item.title}</div>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="sectionHeading">
            <div className="sectionEyebrow">Assessment scope</div>
            <h2>The resilience areas covered by Resiliscore</h2>
            <p>
              The assessment is structured across the operational areas that usually determine
              whether an SME can withstand disruption, respond clearly, and recover with confidence.
            </p>
          </div>

          <div className="featureGrid">
            {domains.map((item) => (
              <article key={item} className="featureCard">
                <div className="featureDot" />
                <div className="featureText">{item}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard sectionCardLight">
          <div className="sectionHeading">
            <div className="sectionEyebrow">What the report is designed to show</div>
            <h2>More than a score or checklist</h2>
            <p>
              The output is intended to be commercially useful. It should help a business owner, operator, or decision-maker understand what is likely to matter first, without needing to interpret technical language or buy a larger audit too early.
            </p>
          </div>

          <div className="featureGrid">
            {expectations.map((item) => (
              <article key={item} className="featureCard">
                <div className="featureDot" />
                <div className="featureText">{item}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard sectionCardDark">
          <div className="sectionHeading sectionHeadingDark">
            <div className="sectionEyebrow">What Resiliscore is not</div>
            <h2>Important boundaries</h2>
            <p>
              Resiliscore is not a penetration test, formal cyber audit, or certification
              process. It is a practical resilience assessment intended to help SMEs identify
              weak points, prioritise action, and decide where deeper support may be needed.
            </p>
          </div>
        </section>

        <section className="sectionCard sectionCardLight ctaSection">
          <div>
            <div className="sectionEyebrow">Start now</div>
            <h2>Check your resilience before pressure exposes the gap</h2>
            <p>
              Take the free assessment, review your resilience position, and decide what to
              improve before a real incident, insurer question, or client request does it for you.
            </p>
          </div>

          <div className="ctaActions">
            <Link href="/assessment" className="btn btnPrimary">
              Take free assessment
            </Link>
            <Link href="/sample-report.pdf" className="btn btnSecondaryLight" target="_blank">
              View sample report
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}