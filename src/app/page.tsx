import Link from "next/link";

const coreSignals = [
  {
    title: "Executive-ready report",
    text: "Turn assessment answers into a premium PDF with clear priorities, estimated impact, benchmark context, and a practical 90-day plan.",
  },
  {
    title: "Built for SMEs",
    text: "Written for smaller businesses that need clarity rather than jargon, without assuming in-house cyber expertise.",
  },
  {
    title: "Practical next steps",
    text: "Focus on the controls that reduce disruption risk fastest instead of receiving a long list of technical recommendations.",
  },
];

const reportHighlights = [
  "Priority risk areas and likely disruption routes",
  "Indicative financial exposure range",
  "Benchmark view against similar SMEs",
  "Framework alignment in plain English",
  "30 / 60 / 90 day improvement plan",
  "Shareable PDF for leadership, clients, or insurers",
];

const trustPoints = [
  {
    label: "Simple",
    text: "Clear language and calm presentation designed for non-technical decision makers.",
  },
  {
    label: "Structured",
    text: "Consistent scoring across resilience domains so results feel reliable and easy to interpret.",
  },
  {
    label: "Useful",
    text: "Outputs built to support action, not just awareness.",
  },
];

const steps = [
  {
    title: "Complete the assessment",
    text: "Answer a short set of structured questions covering governance, identity, response, recovery, suppliers, and operations.",
  },
  {
    title: "Review your resilience position",
    text: "See where your strongest and weakest areas sit, what they mean in business terms, and where disruption is most likely to begin.",
  },
  {
    title: "Use the report to take action",
    text: "Work through the 90-day plan, share the report internally, and use it to support client or insurer conversations.",
  },
];

export default function HomePage() {
  return (
    <main className="homePage">
      <section className="heroWrap">
        <div className="heroBackdrop" />
        <div className="heroOverlay" />

        <div className="homeShell heroShell">
          <div className="heroGrid">
            <div className="heroCopy">
              <div className="heroEyebrow">Cyber resilience maturity for SMEs</div>

              <h1 className="heroTitle">
                Understand your cyber resilience before disruption forces the issue.
              </h1>

              <p className="heroLead">
                Resiliscore gives small and mid-sized businesses a calm, premium way to assess cyber resilience,
                understand likely exposure, and prioritise practical improvements.
              </p>

              <div className="heroActions">
                <Link href="/assessment" className="btn btnPrimary">
                  Take free assessment
                </Link>
                <Link href="/methodology" className="btn btnSecondary">
                  Explore platform
                </Link>
              </div>

              <div className="heroMeta">
                <span>10–15 minutes</span>
                <span>Plain-English results</span>
                <span>Premium PDF report</span>
              </div>
            </div>

            <div className="heroPanel">
              <div className="heroCard heroCardPrimary">
                <div className="heroCardKicker">What you get</div>
                <h2>A modern resilience report built for real business decisions.</h2>
                <p>
                  Designed to help owners, directors, and operational leaders understand where the business is
                  exposed and what to improve first.
                </p>

                <div className="heroSignalGrid">
                  {coreSignals.map((item) => (
                    <div key={item.title} className="heroSignalCard">
                      <div className="heroSignalTitle">{item.title}</div>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="homeShell siteSections">
        <section className="sectionCard sectionCardLight introSection">
          <div className="sectionHeading">
            <div className="sectionEyebrow">Why Resiliscore</div>
            <h2>A premium SaaS-style assessment experience, not just a static security questionnaire.</h2>
            <p>
              Most small businesses know cyber risk matters, but do not have a simple way to understand their
              current resilience position. Resiliscore translates that uncertainty into a structured report that is
              easier to act on and easier to explain.
            </p>
          </div>

          <div className="trustGrid">
            {trustPoints.map((item) => (
              <article key={item.label} className="trustCard">
                <div className="trustLabel">{item.label}</div>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard sectionCardDark valueSection">
          <div className="sectionHeading sectionHeadingDark">
            <div className="sectionEyebrow">Report output</div>
            <h2>Everything is designed to make the result easier to understand and easier to use.</h2>
          </div>

          <div className="featureGrid">
            {reportHighlights.map((item) => (
              <article key={item} className="featureCard">
                <div className="featureDot" />
                <div className="featureText">{item}</div>
              </article>
            ))}
          </div>

          <div className="samplePanel">
            <div>
              <div className="samplePanelLabel">See the output</div>
              <h3>Preview the premium sample report</h3>
              <p>
                Review the structure, tone, and level of detail before taking the assessment.
              </p>
            </div>

            <div className="samplePanelActions">
              <Link href="/sample-report.pdf" className="btn btnGhost" target="_blank">
                Open sample PDF
              </Link>
            </div>
          </div>
        </section>

	

        <section className="sectionCard sectionCardLight processSection">
          <div className="sectionHeading">
            <div className="sectionEyebrow">How it works</div>
            <h2>A simple path from assessment to action.</h2>
          </div>

          <div className="stepsGrid">
            {steps.map((step, index) => (
              <article key={step.title} className="stepCard">
                <div className="stepNumber">0{index + 1}</div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard sectionCardLight ctaSection">
          <div>
            <div className="sectionEyebrow">Start now</div>
            <h2>Get a clearer view of your resilience in minutes.</h2>
            <p>
              Take the free assessment, understand the result, and decide where to improve first.
            </p>
          </div>

          <div className="ctaActions">
            <Link href="/assessment" className="btn btnPrimary">
              Start free assessment
            </Link>
            <Link href="/methodology" className="btn btnSecondaryLight">
              Read methodology
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
