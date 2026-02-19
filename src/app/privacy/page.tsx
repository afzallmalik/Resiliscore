export default function Privacy() {
  return (
    <main>
      <h1>Privacy (MVP)</h1>
      <div className="card">
        <p>Resiliscore is designed to minimise data collection.</p>
        <h3>What we store</h3>
        <ul>
          <li>Assessment answers (scores 0–5)</li>
          <li>Computed scores (overall + domain)</li>
          <li>Optional notes you provide</li>
        </ul>
        <h3>Optional fields</h3>
        <ul>
          <li>Email (only if you choose to provide it)</li>
          <li>Feedback (optional)</li>
        </ul>
        <h3>What we do not need</h3>
        <ul>
          <li>Sensitive personal data</li>
          <li>Passwords (no login for MVP)</li>
        </ul>
      </div>
    </main>
  );
}
