"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Domain = { code: string; name: string; order: number };
type Question = { id: string; domain_code: string; domain_name: string; domain_order: number; question_number: number; text: string; help_text?: string; mapping?: any };

type Answer = { score: number | null; notes: string };

function toIntOrNull(v: string): number | null {
  if (v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return n;
}

export default function AssessmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/questions");
      const json = await res.json();
      const d: Domain[] = (json.domains ?? []).sort((a:Domain,b:Domain)=>a.order-b.order);
      const q: Question[] = (json.questions ?? []).sort((a:Question,b:Question)=>{
        if (a.domain_order !== b.domain_order) return a.domain_order - b.domain_order;
        return a.question_number - b.question_number;
      });
      setDomains(d);
      setQuestions(q);

      // init answers map
      const init: Record<string, Answer> = {};
      for (const item of q) init[item.id] = { score: null, notes: "" };
      setAnswers(init);

      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Question[]> = {};
    for (const d of domains) map[d.code] = [];
    for (const q of questions) map[q.domain_code].push(q);
    return map;
  }, [domains, questions]);

  async function onSubmit() {
    setSubmitting(true);
    try {
      // create assessment
      const a = await fetch("/api/assessments", { method: "POST" });
      const { id } = await a.json();

      // bulk responses
      const payload = {
        responses: Object.entries(answers).map(([q_id, a]) => ({
          q_id,
          score: a.score,
          notes: a.notes || null,
        })),
      };

      const r = await fetch(`/api/assessments/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const err = await r.json();
        console.error(err);
        alert("Could not save responses. Check console.");
        return;
      }

      const c = await fetch(`/api/assessments/${id}/compute`, { method: "POST" });
      if (!c.ok) {
        const err = await c.json();
        console.error(err);
        alert("Could not compute results. Check console.");
        return;
      }

      router.push(`/results/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="card">Loading questions…</div>;

  return (
    <div>
      {domains.map((d) => (
        <div key={d.code} className="card">
          <div className="domainHeader">{d.order}. {d.name}</div>
          <table className="table">
            <thead>
              <tr>
                <th style={{width: "55%"}}>Question</th>
                <th style={{width: "15%"}}>Score</th>
                <th>Notes (optional)</th>
              </tr>
            </thead>
            <tbody>
              {grouped[d.code]?.map((q) => (
                <tr key={q.id}>
                  <td>
                    <div className="pill">{q.id}</div>
                    <div style={{marginTop: 6}}>{q.text}</div>
                        {q.help_text ? <div className="muted" style={{marginTop: 6}}>{q.help_text}</div> : null}
                  </td>
                  <td>
                    <select
                      value={answers[q.id]?.score ?? ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: { ...prev[q.id], score: toIntOrNull(e.target.value) } }))}
                    >
                      <option value="">—</option>
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </td>
                  <td>
                    <textarea
                      value={answers[q.id]?.notes ?? ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: { ...prev[q.id], notes: e.target.value } }))}
                      placeholder="Optional context"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="card">
        <button className="btn" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit & View Results"}
        </button>
        <p className="muted" style={{marginTop: 10}}>
          Tip: You can leave items blank if unknown, but results are more useful when fully completed.
        </p>
      </div>
    </div>
  );
}
