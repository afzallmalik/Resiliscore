import Link from "next/link";

const coreSignals = [
  {
    title: "Plain-English resilience diagnosis",
    text: "Understand where disruption is most likely to begin, why it matters, and what to improve first.",
  },
  {
    title: "Built specifically for SMEs",
    text: "Designed for smaller businesses that need clarity and action, without cyber jargon or enterprise complexity.",
  },
  {
    title: "One-time report, no subscription",
    text: "Use Resiliscore as a practical decision tool before larger spend on consultants, audits, or platforms.",
  },
];

const reportHighlights = [
  "A clear view of your current resilience position",
  "Where disruption is most likely to start",
  "Direct diagnosis of what is likely happening operationally today",
  "A stronger 30 / 60 / 90 day improvement plan",
  "Implementation checklist and management actions",
  "A shareable PDF for leadership, clients, insurers, or partners",
];

const trustPoints = [
  {
    label: "Direct",
    text: "The report is written to show what is most likely going wrong, not to hide behind consultant language.",
  },
  {
    label: "Practical",
    text: "The output is built around ownership, routine, recovery, and evidence — the areas SMEs usually struggle with most.",
  },
  {
    label: "Commercial",
    text: "Use it before spending thousands on a full audit, and before clients, insurers, or partners ask harder questions.",
  },
];

const steps = [
  {
    title: "Complete the assessment",
    text: "Answer structured questions covering governance, access, operations, response, recovery, suppliers, and resilience routines.",
  },
  {
    title: "See where pressure is building",
    text: "Get a clear results view showing where disruption is most likely to begin and what that means in practice.",
  },
  {
    title: "Unlock the full report",
    text: "Get the full PDF with sharper diagnosis, stronger actions, and a practical plan you can actually work through.",
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
              <div className="heroEyebrow">Cyber resilience clarity for SMEs</div>

              <h1 className="heroTitle">
                Understand where cyber weakness is most likely to disrupt your business.
              </h1>

              <p className="heroLead">
                Resiliscore helps SME owners and operational leaders see where resilience is weakest,
                what is most likely happening today, and what to improve before disruption, client
                pressure, or insurer questions force the issue.
              </p>

              <div className="heroActions">
                <Link href="/assessment" className="btn btnPrimary">
                  Take free assessment
                </Link>
                <Link href="/methodology" className="btn btnSecondary">
                  How it works
                </Link>
              </div>

              <div className="heroMeta">
                <span>10–15 minutes</span>
                <span>No subscription</span>
                <span>Built for SMEs</span>
              </div>
            </div>

            <div className="heroPanel">
              <div className="heroCard heroCardPrimary">
                <div className="heroCardKicker">What the report gives you</div>

                <h2>
                  A practical view of what is most likely to go wrong if nothing changes.
                </h2>

                <p>
                  This is not a technical audit and it is not enterprise software. It is a
                  one-time resilience report designed to help you understand your weak points,
                  prioritise action, and decide what support you actually need next.
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
            <h2>Most SMEs do not need more cyber jargon. They need sharper clarity.</h2>
            <p>
              Most smaller businesses already know cyber risk matters. The problem is that they
              often do not know where the real operational weakness sits, what that means in
              practice, or what to fix first.
            </p>
            <p>
              Resiliscore is built to close that gap. It gives you a structured resilience view in
              plain English, with practical next steps, without forcing you into an ongoing
              subscription or a large consultancy commitment.
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
            <div className="sectionEyebrow">Before you spend thousands</div>
            <h2>Use Resiliscore before a full audit, consultant engagement, or heavier cyber spend.</h2>
            <p>
              Many SMEs know they should improve resilience, but do not yet know where to start.
              That often leads to broad advice, unclear scope, or unnecessary spend. Resiliscore
              gives you a practical baseline first.
            </p>
          </div>

          <div className="featureGrid">
            <article className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                A one-time report you can use before committing to a larger audit or security programme
              </div>
            </article>

            <article className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                A clearer way to see where disruption is most likely to begin in your business
              </div>
            </article>

            <article className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                A more credible starting point for leadership, insurers, clients, and IT partners
              </div>
            </article>
          </div>

          <div className="samplePanel">
            <div>
              <div className="samplePanelLabel">Positioning</div>
              <h3>Clarity first. Then decide what needs investment.</h3>
              <p>
                Resiliscore is designed as a practical resilience decision tool — not another
                subscription platform, and not a vague security questionnaire.
              </p>
            </div>

            <div className="samplePanelActions">
              <Link href="/assessment" className="btn btnGhost">
                Start assessment
              </Link>
            </div>
          </div>
        </section>

        <section className="sectionCard sectionCardLight valueSection">
          <div className="sectionHeading">
            <div className="sectionEyebrow">Report output</div>
            <h2>A stronger report built around diagnosis, action, and usability.</h2>
            <p>
              The output is designed to feel commercially useful: clear enough for leadership,
              practical enough for delivery, and credible enough to support external conversations.
            </p>
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
              <Link href="/sample-report.pdf" className="btn btnSecondaryLight" target="_blank">
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
            <h2>Get a clearer view of your resilience before it becomes a business problem.</h2>
            <p>
              Take the free assessment, see where weakness is most likely to create disruption,
              and unlock the full report for a one-time payment of £79.
            </p>
          </div>

          <div className="ctaActions">
            <Link href="/assessment" className="btn btnPrimary">
              Take free assessment
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
