"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AnyQ = any;

type QuestionUI = {
  id: string;
  domain_code: string;
  domain_name: string;
  domain_order: number;
  order: number;
  text: string;
  help_text?: string;
};

type QuestionsPayload = {
  modelVersion?: string;
  domains?: { code: string; name: string; order: number }[];
  questions: AnyQ[];
};

type Answer = { score: number | null };

const SCALE_UI = [
  { v: 0, label: "0", hint: "Not in place" },
  { v: 1, label: "1", hint: "Ad hoc" },
  { v: 2, label: "2", hint: "Repeatable" },
  { v: 3, label: "3", hint: "Defined" },
  { v: 4, label: "4", hint: "Managed" },
  { v: 5, label: "5", hint: "Optimised" },
];

const INDUSTRIES = [
  "Construction & Trades",
  "Professional Services",
  "Healthcare",
  "Education",
  "Finance & Insurance",
  "Retail & eCommerce",
  "Manufacturing",
  "Technology / SaaS",
  "Hospitality & Leisure",
  "Logistics & Transport",
  "Real Estate / Property",
  "Charity / Non-profit",
  "Other",
];

function normaliseQuestions(payload: QuestionsPayload | null): QuestionUI[] {
  if (!payload || !Array.isArray(payload.questions)) return [];

  const domainMap = new Map<string, { name: string; order: number }>();
  for (const d of payload.domains ?? []) domainMap.set(d.code, { name: d.name, order: d.order });

  return payload.questions
    .map((q: AnyQ): QuestionUI | null => {
      const id = q.id;
      if (!id) return null;

      const domain_code = q.domain_code ?? q.domainCode ?? q.domain ?? "General";
      const domainFromMap = domainMap.get(domain_code);

      const domain_name = q.domain_name ?? q.domainName ?? domainFromMap?.name ?? String(domain_code);
      const domain_order = Number(q.domain_order ?? q.domainOrder ?? domainFromMap?.order ?? 999) || 999;

      const order = Number(q.question_number ?? q.questionNumber ?? q.order ?? q.index ?? 0) || 0;

      const text = String(q.text ?? q.prompt ?? "");
      const help_text_raw = q.help_text ?? q.helpText ?? q.help ?? "";
      const help_text = help_text_raw ? String(help_text_raw) : undefined;

      return {
        id: String(id),
        domain_code: String(domain_code),
        domain_name,
        domain_order,
        order,
        text,
        help_text,
      };
    })
    .filter(Boolean)
    .sort((a: QuestionUI, b: QuestionUI) => {
      if (a.domain_order !== b.domain_order) return a.domain_order - b.domain_order;
      return a.order - b.order;
    }) as QuestionUI[];
}

function isValidEmail(v: string) {
  const s = v.trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function AssessmentForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [started, setStarted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [payload, setPayload] = useState<QuestionsPayload | null>(null);
  const questions = useMemo(() => normaliseQuestions(payload), [payload]);

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!started) return;

    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch("/api/questions", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load questions (HTTP ${res.status})`);
        const data = (await res.json()) as QuestionsPayload;

        if (!active) return;
        setPayload(data);

        const init: Record<string, Answer> = {};
        for (const q of normaliseQuestions(data)) init[q.id] = { score: null };
        setAnswers(init);
      } catch (e: any) {
        setErr(e?.message ?? "Something went wrong loading the assessment.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [started]);

  const total = questions.length;

  const answeredCount = useMemo(() => {
    let c = 0;
    for (const q of questions) {
      const a = answers[q.id];
      if (a && a.score !== null) c += 1;
    }
    return c;
  }, [answers, questions]);

  const pct = total ? Math.round((answeredCount / total) * 100) : 0;

  const grouped = useMemo(() => {
    const map = new Map<string, { name: string; order: number; items: QuestionUI[] }>();
    for (const q of questions) {
      if (!map.has(q.domain_code)) map.set(q.domain_code, { name: q.domain_name, order: q.domain_order, items: [] });
      map.get(q.domain_code)!.items.push(q);
    }
    return Array.from(map.entries())
      .map(([code, v]) => ({
        code,
        name: v.name,
        order: v.order,
        items: v.items.slice().sort((a, b) => a.order - b.order),
      }))
      .sort((a, b) => a.order - b.order);
  }, [questions]);

  async function submit() {
    try {
      setSubmitting(true);
      setErr(null);

      const createRes = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: payload?.modelVersion ?? "v1.2",
          email: email.trim(),
          companyName: companyName.trim() || null,
          industry: industry || null,
        }),
      });

      if (!createRes.ok) {
        const t = await createRes.text().catch(() => "");
        throw new Error(`Could not start assessment (HTTP ${createRes.status}) ${t}`);
      }

      const created = await createRes.json();
      const assessmentId = created?.id;
      if (!assessmentId) throw new Error("Assessment ID missing.");

      const responsesPayload = questions.map((q) => ({
        q_id: q.id,
        score: answers[q.id]?.score ?? null,
        notes: null,
      }));

      const saveRes = await fetch(`/api/assessments/${assessmentId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: responsesPayload }),
      });

      if (!saveRes.ok) {
        const j = await saveRes.json().catch(() => null);
        const msg = j?.error ? `${j.error}` : `Could not save responses (HTTP ${saveRes.status})`;
        throw new Error(msg);
      }

      const computeRes = await fetch(`/api/assessments/${assessmentId}/compute`, { method: "POST" });
      if (!computeRes.ok) {
        const t = await computeRes.text().catch(() => "");
        throw new Error(`Could not compute results (HTTP ${computeRes.status}) ${t}`);
      }

      router.push(`/results/${assessmentId}`);
    } catch (e: any) {
      setErr(e?.message ?? "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!started) {
    const emailOk = isValidEmail(email);
    const canStart = emailOk && !!industry;

    return (
      <main>
        <div className="card" style={{ padding: 26 }}>
          <h1 style={{ marginTop: 0 }}>Start Assessment</h1>

          <p className="muted" style={{ maxWidth: "80ch", marginBottom: 10 }}>
            Complete your free cyber resilience assessment to receive your dashboard results and resilience snapshot.
          </p>

          <p className="muted" style={{ maxWidth: "80ch", marginBottom: 18 }}>
            After completion, you’ll have the option to unlock the full premium PDF report for <strong style={{ color: "var(--text)" }}>£99</strong>.
          </p>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              background: "rgba(255,255,255,0.02)",
              padding: 16,
              display: "grid",
              gap: 8,
              maxWidth: 720,
              marginBottom: 18,
            }}
          >
            <div style={{ fontWeight: 700 }}>Included free</div>
            <div className="muted">Overall score, grade, domain dashboard, and top priorities.</div>

            <div style={{ fontWeight: 700, marginTop: 8 }}>Premium report (£99)</div>
            <div className="muted">
              Full branded PDF report, detailed domain analysis, tailored premium insight pages, 30/60/90 plan, and implementation checklist.
            </div>
          </div>

          <div style={{ display: "grid", gap: 14, marginTop: 18, maxWidth: 560 }}>
            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Email (required)</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.02)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
              {!emailOk ? (
                <div className="muted" style={{ marginTop: 6, color: "rgba(255,120,120,0.9)" }}>
                  Please enter a valid email to start the assessment.
                </div>
              ) : null}
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Company name (optional)</div>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company name"
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.02)",
                  color: "var(--text)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <div className="muted" style={{ marginBottom: 6 }}>Industry (required)</div>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.02)",
                  color: "var(--text)",
                  outline: "none",
                }}
              >
                <option value="">Select an industry…</option>
                {INDUSTRIES.map((x) => (
                  <option key={x} value={x}>{x}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
              <button
                className="btn primary"
                type="button"
                disabled={!canStart}
                onClick={() => setStarted(true)}
              >
                Start questions
              </button>

              <a className="btn" href="/methodology">
                Read methodology
              </a>
            </div>

            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              Free dashboard included. Premium PDF report available after completion for £99.
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="muted">Loading assessment…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="card">
        <h2>Assessment</h2>
        <p className="muted">{err}</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="card">
        <h2>Assessment</h2>
        <p className="muted">No questions loaded.</p>
      </div>
    );
  }

  return (
    <div className="assess">
      <section className="assess-head">
        <div className="assess-hero card">
          <div className="assess-kicker">Cyber resilience maturity assessment</div>
          <h1 className="assess-title">Resiliscore Assessment</h1>
          <p className="assess-sub">
            Score each statement from <strong>0 to 5</strong>. Unanswered questions can be left blank — they won’t be counted
            in scoring.
          </p>

          <div className="assess-progress">
            <div className="assess-progress-top">
              <div className="muted">
                Progress: <strong>{answeredCount}</strong> / {total} answered
              </div>
              <div className="muted">{pct}%</div>
            </div>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <details className="assess-help">
            <summary>How to use the 0–5 scale</summary>
            <div className="help-grid">
              {SCALE_UI.map((s) => (
                <div key={s.v} className="help-item">
                  <div className="pill-mini">{s.label}</div>
                  <div className="muted">{s.hint}</div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </section>

      <section className="assess-body">
        {grouped.map((g) => (
          <div key={g.code} className="domain">
            <div className="domain-head">
              <div className="domain-title">{g.name}</div>
              <div className="domain-sub muted">Answer based on what is true in practice.</div>
            </div>

            <div className="domain-list">
              {g.items.map((q, idx) => {
                const a = answers[q.id] ?? { score: null };
                const num = idx + 1;

                return (
                  <div key={q.id} className="q card">
                    <div className="q-top">
                      <div className="q-num">Q{num}</div>
                      <div className="q-text">{q.text}</div>
                    </div>

                    {q.help_text ? (
                      <details className="q-help">
                        <summary>Help</summary>
                        <div className="muted">{q.help_text}</div>
                      </details>
                    ) : null}

                    <div className="q-scale">
                      {SCALE_UI.map((s) => {
                        const active = a.score === s.v;
                        return (
                          <button
                            key={s.v}
                            type="button"
                            className={`q-pill ${active ? "active" : ""}`}
                            onClick={() =>
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: { ...prev[q.id], score: s.v },
                              }))
                            }
                          >
                            <span className="q-pill-num">{s.label}</span>
                            <span className="q-pill-hint">{s.hint}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <div className="sticky">
        <div className="sticky-inner">
          <div className="muted">
            Answered <strong>{answeredCount}</strong> / {total} ({pct}%)
          </div>
          <button className="btn primary" disabled={submitting} onClick={submit}>
            {submitting ? "Submitting…" : "Submit & View Results"}
          </button>
        </div>
      </div>

      <style>{`
        .assess { padding-bottom: 90px; }
        .assess-hero { padding: 28px; }
        .assess-kicker { color: var(--muted); font-size: 13px; letter-spacing: 0.2px; }
        .assess-title { margin: 10px 0 10px; font-size: 34px; }
        .assess-sub { color: var(--muted); margin: 0; max-width: 80ch; line-height: 1.6; }

        .assess-progress { margin-top: 18px; }
        .assess-progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .bar { height: 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); overflow: hidden; }
        .bar-fill { height: 100%; background: var(--primary); }

        .assess-help { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 14px; }
        .assess-help summary { cursor: pointer; color: var(--text); font-weight: 600; }
        .help-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
        @media (max-width: 900px) { .help-grid { grid-template-columns: 1fr; } }
        .help-item { display: flex; gap: 10px; align-items: center; }
        .pill-mini { width: 34px; height: 26px; display:flex; align-items:center; justify-content:center; border-radius: 8px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--primary); font-weight: 700; font-size: 13px; }

        .domain { margin-top: 26px; }
        .domain-title { font-size: 18px; font-weight: 700; }
        .domain-list { display: grid; gap: 14px; margin-top: 12px; }

        .q { padding: 22px; }
        .q-top { display: grid; grid-template-columns: 58px 1fr; gap: 14px; align-items: start; }
        .q-num { color: var(--muted); font-size: 13px; padding-top: 2px; }
        .q-text { font-weight: 600; line-height: 1.45; }

        .q-help { margin-top: 10px; }
        .q-help summary { cursor: pointer; color: var(--muted); }

        .q-scale { margin-top: 14px; display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
        @media (max-width: 900px) { .q-scale { grid-template-columns: 1fr 1fr; } }

        .q-pill {
          text-align: left;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          color: var(--text);
          cursor: pointer;
        }
        .q-pill:hover { border-color: rgba(255,255,255,0.22); }
        .q-pill.active { border-color: rgba(94,234,106,0.55); background: rgba(94,234,106,0.10); }
        .q-pill-num { font-weight: 800; margin-right: 8px; color: var(--primary); }
        .q-pill-hint { color: var(--muted); font-size: 12px; }

        .sticky {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          border-top: 1px solid var(--border);
          background: rgba(6, 27, 34, 0.92);
          backdrop-filter: blur(8px);
          padding: 12px 0;
          z-index: 60;
        }
        .sticky-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}