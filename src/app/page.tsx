import Link from "next/link";

export default function HomePage() {
  return (
    <main className="homePage">

      {/* HERO */}
      <section className="heroWrap">
        <div className="heroBackdrop" />
        <div className="heroOverlay" />

        <div className="homeShell heroShell">
          <div className="heroGrid">

            <div className="heroCopy">
              <div className="heroEyebrow">
                Cyber resilience clarity for SMEs
              </div>

              <h1 className="heroTitle">
                Understand your cyber risk — and what it means for your business.
              </h1>

              <p className="heroLead">
                Resiliscore gives business owners a clear, structured view of cyber resilience —
                highlighting where disruption is most likely to start, what it could cost, and what to fix first.
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

                <div className="heroCardKicker">Why businesses use Resiliscore</div>

                <h2>
                  Clarity first. Then decide what to invest in.
                </h2>

                <p>
                  Most small businesses go straight into expensive audits without knowing
                  where their real risks are. Resiliscore gives you that clarity first —
                  so you can make better decisions.
                </p>

                <div className="heroSignalGrid">
                  <div className="heroSignalCard">
                    <div className="heroSignalTitle">Avoid unnecessary spend</div>
                    <p>Understand your position before committing to consultants or platforms.</p>
                  </div>

                  <div className="heroSignalCard">
                    <div className="heroSignalTitle">Focus on real risks</div>
                    <p>See where disruption is most likely to start in business terms.</p>
                  </div>

                  <div className="heroSignalCard">
                    <div className="heroSignalTitle">Make better decisions</div>
                    <p>Prioritise what actually matters instead of generic recommendations.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="homeShell siteSections">

        {/* WHY THIS EXISTS */}
        <section className="sectionCard sectionCardLight">

          <div className="sectionHeading">
            <div className="sectionEyebrow">Why Resiliscore exists</div>

            <h2>
              Most cyber tools weren’t built for small businesses.
            </h2>

            <p>
              Traditional cyber security assessments are often expensive, technical,
              and designed for larger organisations with dedicated teams.
              For most SMEs, that creates a gap between knowing cyber risk matters
              and actually understanding what to do about it.
            </p>

            <p>
              Resiliscore closes that gap by providing a clear, structured view of your
              resilience — without requiring technical expertise or long-term commitments.
            </p>
          </div>

        </section>

        {/* PRE-AUDIT POSITIONING */}
        <section className="sectionCard sectionCardDark">

          <div className="sectionHeading sectionHeadingDark">
            <div className="sectionEyebrow">Before you spend thousands</div>

            <h2>
              A practical step before a full cyber audit.
            </h2>

            <p>
              Many businesses consider audits or consultancy without knowing where
              their real risks sit. That often leads to unclear scope, unnecessary spend,
              or work that doesn’t address the most important issues first.
            </p>
          </div>

          <div className="featureGrid">

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Typical cyber audits can cost <strong>£5,000–£15,000+</strong>
              </div>
            </div>

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Scope and priorities are often unclear at the start
              </div>
            </div>

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Important risks may not be addressed first
              </div>
            </div>

          </div>

          <div className="samplePanel">

            <div>
              <div className="samplePanelLabel">The Resiliscore approach</div>

              <h3>
                Start with clarity. Then decide what to invest in.
              </h3>

              <p>
                For a one-time cost, Resiliscore gives you a structured view of your
                resilience, helping you decide whether you need further support —
                and where it should be focused.
              </p>
            </div>

            <div className="samplePanelActions">
              <Link href="/assessment" className="btn btnGhost">
                Start assessment
              </Link>
            </div>

          </div>

        </section>

        {/* WHAT YOU GET */}
        <section className="sectionCard sectionCardLight">

          <div className="sectionHeading">
            <div className="sectionEyebrow">Report output</div>

            <h2>
              A report designed for real business decisions.
            </h2>

            <p>
              The output is structured to help you understand risk quickly,
              communicate it clearly, and take practical action.
            </p>
          </div>

          <div className="featureGrid">

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Priority risk areas and likely disruption routes
              </div>
            </div>

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Indicative financial exposure in business terms
              </div>
            </div>

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Clear 30 / 60 / 90 day improvement plan
              </div>
            </div>

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Benchmark-style comparison for context
              </div>
            </div>

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Plain-English explanation (no technical jargon)
              </div>
            </div>

            <div className="featureCard">
              <div className="featureDot" />
              <div className="featureText">
                Shareable PDF for leadership, clients, or insurers
              </div>
            </div>

          </div>

          <div className="samplePanel">
            <div>
              <div className="samplePanelLabel">Preview</div>
              <h3>View a sample report</h3>
              <p>
                See exactly how the report is structured before taking the assessment.
              </p>
            </div>

            <div className="samplePanelActions">
              <Link href="/sample-report.pdf" className="btn btnSecondaryLight" target="_blank">
                Open sample PDF
              </Link>
            </div>
          </div>

        </section>

        {/* HOW IT WORKS */}
        <section className="sectionCard sectionCardLight">

          <div className="sectionHeading">
            <div className="sectionEyebrow">How it works</div>
            <h2>A simple path from assessment to action.</h2>
          </div>

          <div className="stepsGrid">

            <div className="stepCard">
              <div className="stepNumber">01</div>
              <div>
                <h3>Complete the assessment</h3>
                <p>
                  Answer structured questions covering key resilience areas such as
                  access, response, recovery, and suppliers.
                </p>
              </div>
            </div>

            <div className="stepCard">
              <div className="stepNumber">02</div>
              <div>
                <h3>Understand your position</h3>
                <p>
                  See where your strongest and weakest areas are, and what they mean
                  in real business terms.
                </p>
              </div>
            </div>

            <div className="stepCard">
              <div className="stepNumber">03</div>
              <div>
                <h3>Decide what to do next</h3>
                <p>
                  Use the report to prioritise improvements or decide whether further
                  support or audit is needed.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* FINAL CTA */}
        <section className="sectionCard sectionCardLight ctaSection">

          <div>
            <div className="sectionEyebrow">Start now</div>

            <h2>
              Get a clearer view of your cyber resilience in minutes.
            </h2>

            <p>
              Understand your risk, prioritise improvements, and make better decisions
              before committing to larger investments.
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