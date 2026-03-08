import Link from "next/link";
import ResultsClient from "./ResultsClient";

function getBaseUrl() {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase && envBase.length > 0) return envBase.replace(/\/$/, "");
  return "http://localhost:3000";
}

async function getResults(id: string) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assessments/${id}/results`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const data = await getResults(params.id);

  if (!data) {
    return (
      <main>
        <h1>Results</h1>
        <div className="card">Result not found.</div>
        <Link className="btn primary" href="/assessment">
          Start a new assessment
        </Link>
      </main>
    );
  }

  return (
    <main>
      <ResultsClient id={params.id} data={data} />
    </main>
  );
}