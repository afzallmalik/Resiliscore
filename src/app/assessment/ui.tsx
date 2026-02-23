"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Domain = { code: string; name: string; order: number };
type Question = {
  id: string;
  domain_code: string;
  domain_name: string;
  domain_order: number;
  question_number: number;
  text: string;
  help_text: string;
  mapping: any;
};

type Answer = { score: number | null; notes: string };

function toIntOrNull(v: string): number | null {
  if (v === "" || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const CMMI = [
  { value: 0, label: "0 – Not in place" },
  { value: 1, label: "1 – Initial" },
  { value: 2, label: "2 – Managed" },
  { value: 3, label: "3 – Defined" },
  { value: 4, label: "4 – Quantitatively Managed" },
  { value: 5, label: "5 – Optimising" },
] as const;

export default function AssessmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [domains, setDomains] = useState<Domain[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/questions", { cache: "no-store" });
      const json = await res.json();

      const d: Domain[] = (json.domains ?? []).sort((a: Domain, b: Domain) => a.order - b.order);
      const q: Question[] = (json.questions ?? []).sort((a: Question, b: Question) => {
        if (a.domain_order !== b.domain_order) return a.domain_order - b.domain_order;
        return a.question_number - b.question_number;
      });

      setDomains(d);
      setQuestions(q);

      const init: Record<string, Answer> = {};
      for (const item of q) init[item.id] = { score: null, notes: "" };
      setAnswers(init);

      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Question[]> = {};
    for (const d of domains) map[d.code] = [];
    for (const q of questions) (map[q.domain_code] ||= []).push(q);
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
        responses: Object.entries(answers).map(([q_id, an]) => ({
          q_id,
          score: an.score,
          notes: an.notes || null,
        })),
      };

      const r = await fetch(`/api/assessments/${id}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        console.error(err);
        alert("Could not save responses. Check console.");
        return;
      }

      const c = await fetch(`/api/assessments/${id}/compute`, { method: "POST" });
      if (!c.ok) {
        const err = await c.json().catch(() => ({}));
        console.error(err);
        alert("Could not compute results. Check console.");
        return;
      }

      router.push(`/results/${id}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
        Loading questions…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Legend */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>CMMI scale</div>
        <div style={{ fontSize: 13, opacity: 0.75, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {CMMI.map((x) => (
            <span key={x.value}>
              <b>{x.value}</b> {x.label.replace(/^\d+\s–\s/, "")}
            </span>
          ))}
        </div>
      </div>

      {domains.map((d) => (
        <section key={d.code} style={{ marginBottom: 22 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: "18px 0 10px" }}>
            {d.order}. {d.name}
          </h2>

          <div style={{ border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 320px",
                gap: 0,
                padding: "10px 14px",
                background: "#fafafa",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <div>Question</div>
              <div>Notes (optional)</div>
            </div>

            {(grouped[d.code] ?? []).map((q) => {
              const selected = answers[q.id]?.score;

              return (
                <div
                  key={q.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 320px",
                    gap: 0,
                    padding: "14px 14px",
                    borderTop: "1px solid #eee",
                    alignItems: "start",
                  }}
                >
                  {/* Question + pills UNDER */}
                  <div style={{ paddingRight: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 6 }}>
                      {q.domain_code}_{String(q.question_number).padStart(2, "0")}
                    </div>

                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{q.text}</div>

                    {q.help_text ? (
                      <div style={{ fontSize: 13, opacity: 0.75, lineHeight: 1.45, marginBottom: 10 }}>
                        {q.help_text}
                      </div>
                    ) : null}

                    {/* Pills */}
                    <div
                      role="radiogroup"
                      aria-label={`CMMI score for ${q.id}`}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        marginTop: 6,
                      }}
                    >
                      {CMMI.map((opt) => {
                        const active = selected === opt.value;
                        return (
                          <label
                            key={opt.value}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 10px",
                              borderRadius: 999,
                              border: "1px solid #ddd",
                              cursor: "pointer",
                              userSelect: "none",
                              fontSize: 13,
                              fontWeight: 600,
                              background: active ? "#111" : "#fff",
                              color: active ? "#fff" : "#111",
                            }}
                          >
                            <input
                              type="radio"
                              name={`score-${q.id}`}
                              value={opt.value}
                              checked={selected === opt.value}
                              onChange={(e) =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: { ...prev[q.id], score: toIntOrNull(e.target.value) },
                                }))
                              }
                              style={{ margin: 0 }}
                            />
                            <span>{opt.value}</span>
                            <span style={{ opacity: active ? 0.95 : 0.7 }}>
                              {opt.label.replace(/^\d+\s–\s/, "")}
                            </span>
                          </label>
                        );
                      })}
                      {/* Clear */}
                      <button
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [q.id]: { ...prev[q.id], score: null },
                          }))
                        }
                        style={{
                          marginLeft: 8,
                          padding: "8px 10px",
                          borderRadius: 999,
                          border: "1px dashed #bbb",
                          background: "#fff",
                          cursor: "pointer",
                          fontSize: 13,
                          opacity: 0.75,
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <textarea
                      value={answers[q.id]?.notes ?? ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [q.id]: { ...prev[q.id], notes: e.target.value },
                        }))
                      }
                      placeholder="Optional context…"
                      style={{
                        width: "100%",
                        minHeight: 90,
                        resize: "vertical",
                        padding: 10,
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        fontFamily: "inherit",
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div style={{ marginTop: 18, padding: 14, border: "1px solid #eee", borderRadius: 14 }}>
        <button
          className="btn"
          onClick={onSubmit}
          disabled={submitting}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {submitting ? "Submitting…" : "Submit & View Results"}
        </button>

        <p style={{ fontSize: 13, opacity: 0.7, marginTop: 10 }}>
          Tip: You can leave items blank if unknown, but results are more useful when fully completed.
        </p>
      </div>
    </div>
  );
}