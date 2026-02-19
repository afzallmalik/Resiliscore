import Link from "next/link";
import { headers } from "next/headers";

function getBaseUrl() {
  // Prefer explicit env (useful for local dev / hardcoding), otherwise derive from request headers.
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase && envBase.length > 0) return envBase.replace(/\/$/, "");

  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

async function getResults(id: string) {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/assessments/${id}/results`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function topN(domain_scores: any[], n: number, dir: "asc" | "desc") {
  const s = [...(domain_scores ?? [])].sort((a,b)=> (dir==="asc" ? a.score-b.score : b.score-a.score));
  return s.slice(0,n);
}

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const data = await getResults(params.id);
  if (!data) {
    return (
      <main>
        <h1>Results</h1>
        <div className="card">Result not found.</div>
        <Link className="btn" href="/assessment">Start a new assessment</Link>
      </main>
    );
  }

  const strengths = topN(data.domain_scores, 3, "desc");
  const risks = topN(data.domain_scores, 3, "asc");

  return (
    <main>
      <h1>Results</h1>

      <div className="grid two">
        <div className="card">
          <div className="muted">Overall Score</div>
          <div className="score">{data.overall_score ?? 0}</div>
          <div className="muted">Grade</div>
          <div className="score">{data.grade ?? "-"}</div>
        </div>

        <div className="card">
          <div className="muted">Interpretation</div>
          <p>{data.interpretation ?? ""}</p>
          <div style={{ marginTop: 12 }} className="row gap">
            <a className="btn" href={`/api/assessments/${params.id}/pdf`} target="_blank" rel="noreferrer">Download PDF</a>
            <Link className="btn secondary" href="/assessment">New Assessment</Link>
          </div>
        </div>
      </div>

      <div className="grid two" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Domain Scores</h2>
          <div className="list">
            {(data.domain_scores ?? []).map((d:any) => (
              <div key={d.code} className="row between">
                <div>
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div className="muted">RAG: {d.rag}</div>
                </div>
                <div className="score">{d.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Highlights</h2>
          <div className="muted" style={{ marginBottom: 6 }}>Top strengths</div>
          <ul>
            {strengths.map((d:any)=> <li key={d.code}>{d.name} ({d.score})</li>)}
          </ul>
          <div className="muted" style={{ marginTop: 12, marginBottom: 6 }}>Top risk areas</div>
          <ul>
            {risks.map((d:any)=> <li key={d.code}>{d.name} ({d.score})</li>)}
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>High-Level Recommendations (Next 90 Days)</h2>
        <ul>
          {(data.recommendations ?? []).map((r:string, i:number) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    </main>
  );
}
