import Link from "next/link";

const coreSignals = [
  {
    title: "Expose the resilience visibility gap",
    text: "See the gap between what the business believes is in place and what it can actually prove under pressure.",
  },
  {
    title: "Built specifically for SMEs",
    text: "Designed for business owners and operational leaders who need clarity, not enterprise cyber jargon.",
  },
  {
    title: "One-time report, no subscription",
    text: "Use Resiliscore before spending thousands on audits, consultants, or larger cyber programmes.",
  },
];

const reportHighlights = [
  "Your Resilience Visibility Score",
  "Where disruption is most likely to start",
  "What is likely happening operationally today",
  "Sharper priorities and immediate actions",
  "30 / 60 / 90 day improvement plan",
  "A clear PDF report for leadership, clients, insurers, or partners",
];

const misconceptions = [
  "We have backups, so we are safe",
  "Our IT provider handles it",
  "We have never had an issue",
  "We would probably cope if something happened",
];

const steps = [
  {
    title: "Complete the assessment",
    text: "Answer structured questions covering governance, access, operations, response, recovery, suppliers, and resilience routines.",
  },
  {
    title: "See your visibility gap",
    text: "Understand where the business may be assuming too much and where resilience is weakest under pressure.",
  },
  {
    title: "Unlock the full report",
    text: "Get the full PDF with sharper diagnosis, stronger actions, and a practical plan you can work through immediately.",
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
                Most businesses think they are covered. Few can prove they would recover.
              </h1>

              <p className="heroLead">
                Resiliscore exposes your resilience visibility gap — the gap between what your business believes is in place and what it can actually prove under pressure.
              </p>

              <div className="heroActions">
                <Link href="/assessment" className="btn btnPrimary">
                  Get your resilience score
                </Link>
                <Link href="/sample-report.pdf" className="btn btnSecondary" target="_blank">
                  View sample report
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
                <div className="heroCardKicker">What Resiliscore reveals</div>

                <h2>
                  A practical view of how resilient your business actually is — not how resilient you assume it is.
                </h2>

                <p>
                  This is not a technical audit and it is not another generic cyber checklist. It is a one-time resilience report built to show where assumptions break down, what that means commercially, and what to fix first.
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
            <div className="sectionEyebrow">The resilience visibility gap</div>
            <h2>Most SMEs do not lack tools. They lack visibility.</h2>
            <p>
              Many businesses have backups, policies, antivirus, or an IT provider. But when pressure hits, they often cannot prove recovery capability, operational continuity, ownership, or evidence quickly enough.
            </p>
            <p>
              That is the resilience visibility gap: the difference between what the business thinks is in place and what it can actually demonstrate when it matters.
            </p>
          </div>
        </section>

        <section className="sectionCard sectionCardLight valueSection">
          <div className="sectionHeading">
            <div className="sectionEyebrow">What most businesses get wrong</div>
            <h2>Weak resilience is often hidden until something goes wrong.</h2>
            <p>
              The issue is usually not that nothing exists. The issue is that controls are not owned clearly enough, tested often enough, or evidenced well enough to hold up under pressure.
            </p>
          </div>

          <div className="featureGrid">
            {misconceptions.map((item) => (
              <article key={item} className="featureCard">
                <div className="featureDot" />
                <div className="featureText">“{item}”</div>
              </article>
            ))}
          </div>
        </section>

        <section className="sectionCard sectionCardDark valueSection">
          <div className="sectionHeading sectionHeadingDark">
            <div className="sectionEyebrow">What Resiliscore does</div>
            <h2>It gives you an evidence-based view of resilience before a real incident, insurer question, or client review does.</h2>
            <p>
              Use Resiliscore before you commit to bigger cyber spend. It gives you a practical baseline first, so you can see where disruption is most likely to start and what support you actually need next.
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
              <div className="samplePanelLabel">Before a full audit</div>
              <h3>Use Resiliscore before spending thousands on broader cyber support.</h3>
              <p>
                It is a practical decision tool for SMEs: plain English, one-time, and designed to show whether what you already have would actually hold up under pressure.
              </p>
            </div>

            <div className="samplePanelActions">
              <Link href="/assessment" className="btn btnGhost">
                Start assessment
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
            <h2>You do not need more cyber jargon. You need to know whether what you already have would actually work.</h2>
            <p>
              Take the assessment, expose your resilience visibility gap, and unlock the full report for a one-time payment of £79.
            </p>
          </div>

          <div className="ctaActions">
            <Link href="/assessment" className="btn btnPrimary">
              Start your assessment
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
