import AssessmentForm from "./ui";

export default function AssessmentPage() {
  return (
    <main>
      <h1>Assessment</h1>
      <p className="muted">Score each item from 0 to 5. This is a maturity diagnostic (not an audit or certification).</p>
      <AssessmentForm />
    </main>
  );
}
