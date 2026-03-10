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
    .filter((q): q is QuestionUI => q !== null)
    .sort((a, b) => {
      if (a.domain_order !== b.domain_order) return a.domain_order - b.domain_order;
      return a.order - b.order;
    });
}

function isValidEmail(v: string) {
  const s = v.trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function DomainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 5 5v6c0 5 3.4 9.4 7 11 3.6-1.6 7-6 7-11V5l-7-3Zm0 2.2 5 2.14V11c0 3.85-2.42 7.18-5 8.53C9.42 18.18 7 14.85 7 11V6.34l5-2.14Z"
      />
    </svg>
  );
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [unansweredIds, setUnansweredIds] = useState<Set<string>>(new Set());

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
      if (!map.has(q.domain_code)) {
        map.set(q.domain_code, { name: q.domain_name, order: q.domain_order, items: [] });
      }
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
      setSubmitError(null);

      const unanswered = questions.filter((q) => {
        const value = answers[q.id]?.score;
        return value === null || value === undefined;
      });

      if (unanswered.length > 0) {
        const missingIds = new Set(unanswered.map((q) => q.id));
        setUnansweredIds(missingIds);
        setSubmitError(`Please answer all questions before submitting. ${unanswered.length} remaining.`);

        const firstMissing = unanswered[0];
        const el = document.getElementById(`question-${firstMissing.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        setSubmitting(false);
        return;
      }

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
        <div className="af-startCard">
          <div className="af-startGrid">
            <div>
              <div className="af-startEyebrow">Free dashboard first</div>
              <h2>Start your assessment</h2>
              <p className="af-startLead">
                Complete your free cyber resilience assessment to receive your dashboard results and resilience snapshot.
              </p>

              <div className="af-tierGrid">
                <div className="af-tierCard">
                  <div className="af-tierTitle">Included free</div>
                  <div className="af-tierText">
                    Overall score, grade, domain dashboard, and top priorities.
                  </div>
                </div>

                <div className="af-tierCard af-tierCardAccent">
                  <div className="af-tierTitle">Premium report (£99)</div>
                  <div className="af-tierText">
                    Full branded PDF report, detailed domain analysis, tailored insight pages, 30/60/90 plan, and implementation checklist.
                  </div>
                </div>
              </div>
            </div>

            <div className="af-formPanel">
              <div className="af-field">
                <label className="af-label">Email (required)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="af-input"
                />
                {!emailOk ? (
                  <div className="af-errorText">Please enter a valid email to start the assessment.</div>
                ) : null}
              </div>

              <div className="af-field">
                <label className="af-label">Company name (optional)</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  className="af-input"
                />
              </div>

              <div className="af-field">
                <label className="af-label">Industry (required)</label>
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="af-input">
                  <option value="">Select an industry…</option>
                  {INDUSTRIES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>

              <div className="af-startActions">
                <button className="af-btn af-btnPrimary" type="button" disabled={!canStart} onClick={() => setStarted(true)}>
                  Start questions
                </button>

                <a className="af-btn af-btnSecondary" href="/methodology">
                  Read methodology
                </a>
              </div>

              <div className="af-smallNote">
                Free dashboard included. Premium PDF report available after completion for £99.
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .af-startCard {
            border-radius: 24px;
            padding: 24px;
            background: #ffffff;
            border: 1px solid rgba(6,27,34,0.08);
            box-shadow: 0 12px 30px rgba(3,16,22,0.08);
          }

          .af-startGrid {
            display: grid;
            grid-template-columns: 1.05fr 0.95fr;
            gap: 22px;
            align-items: start;
          }

          .af-startEyebrow {
            color: #0a8d62;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }

          .af-startCard h2 {
            margin: 8px 0 0;
            color: #061b22;
            font-size: 34px;
            line-height: 1.08;
          }

          .af-startLead {
            margin: 12px 0 0;
            color: rgba(6,27,34,0.72);
            line-height: 1.7;
            max-width: 64ch;
          }

          .af-tierGrid {
            margin-top: 18px;
            display: grid;
            gap: 12px;
          }

          .af-tierCard {
            border-radius: 18px;
            padding: 16px;
            background: #fbfcfd;
            border: 1px solid rgba(6,27,34,0.08);
          }

          .af-tierCardAccent {
            background: rgba(13,177,123,0.07);
            border-color: rgba(13,177,123,0.18);
          }

          .af-tierTitle {
            color: #061b22;
            font-weight: 850;
          }

          .af-tierText {
            margin-top: 8px;
            color: rgba(6,27,34,0.72);
            line-height: 1.6;
          }

          .af-formPanel {
            border-radius: 20px;
            padding: 18px;
            background: #f8fbfb;
            border: 1px solid rgba(6,27,34,0.08);
            display: grid;
            gap: 14px;
          }

          .af-field {
            display: grid;
            gap: 8px;
          }

          .af-label {
            color: #061b22;
            font-size: 14px;
            font-weight: 700;
          }

          .af-input {
            width: 100%;
            min-height: 46px;
            padding: 0 14px;
            border-radius: 14px;
            border: 1px solid rgba(6,27,34,0.12);
            background: #ffffff;
            color: #061b22;
            outline: none;
          }

          .af-input:focus {
            border-color: rgba(13,177,123,0.42);
            box-shadow: 0 0 0 3px rgba(13,177,123,0.12);
          }

          .af-errorText {
            color: #c94a4a;
            font-size: 13px;
          }

          .af-startActions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            padding-top: 4px;
          }

          .af-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-height: 46px;
            padding: 0 16px;
            border-radius: 999px;
            border: 1px solid transparent;
            text-decoration: none;
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
          }

          .af-btn:hover {
            transform: translateY(-1px);
          }

          .af-btnPrimary {
            background: #0db17b;
            color: #ffffff;
            box-shadow: 0 8px 20px rgba(13,177,123,0.22);
          }

          .af-btnPrimary:hover {
            background: #0a8d62;
          }

          .af-btnPrimary:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
          }

          .af-btnSecondary {
            background: #ffffff;
            color: #061b22;
            border-color: rgba(6,27,34,0.12);
          }

          .af-btnSecondary:hover {
            background: #f4f7f8;
          }

          .af-smallNote {
            color: rgba(6,27,34,0.62);
            font-size: 13px;
          }

          @media (max-width: 900px) {
            .af-startGrid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 700px) {
            .af-startCard {
              padding: 18px;
            }

            .af-startCard h2 {
              font-size: 28px;
            }
          }
        `}</style>
      </main>
    );
  }

  if (loading) {
    return (
      <div className="af-loadCard">
        <div className="af-loadText">Loading assessment…</div>

        <style>{`
          .af-loadCard {
            border-radius: 22px;
            padding: 22px;
            background: #ffffff;
            border: 1px solid rgba(6,27,34,0.08);
            box-shadow: 0 10px 28px rgba(3,16,22,0.08);
          }

          .af-loadText {
            color: rgba(6,27,34,0.72);
          }
        `}</style>
      </div>
    );
  }

  if (err) {
    return (
      <div className="af-loadCard">
        <h2 style={{ marginTop: 0 }}>Assessment</h2>
        <p className="af-loadText">{err}</p>
        <button className="af-btn af-btnPrimary" type="button" onClick={() => setErr(null)} style={{ marginTop: 12 }}>
          Return to assessment
        </button>

        <style>{`
          .af-loadCard {
            border-radius: 22px;
            padding: 22px;
            background: #ffffff;
            border: 1px solid rgba(6,27,34,0.08);
            box-shadow: 0 10px 28px rgba(3,16,22,0.08);
          }

          .af-loadText {
            color: rgba(6,27,34,0.72);
          }

          .af-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 46px;
            padding: 0 16px;
            border-radius: 999px;
            border: 1px solid transparent;
            font-weight: 800;
            cursor: pointer;
          }

          .af-btnPrimary {
            background: #0db17b;
            color: #fff;
          }
        `}</style>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="af-loadCard">
        <h2 style={{ marginTop: 0 }}>Assessment</h2>
        <p className="af-loadText">No questions loaded.</p>

        <style>{`
          .af-loadCard {
            border-radius: 22px;
            padding: 22px;
            background: #ffffff;
            border: 1px solid rgba(6,27,34,0.08);
            box-shadow: 0 10px 28px rgba(3,16,22,0.08);
          }

          .af-loadText {
            color: rgba(6,27,34,0.72);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="af-shell">
      <section className="af-assessmentHero">
        <div className="af-assessmentKicker">Cyber resilience maturity assessment</div>
        <h2 className="af-assessmentTitle">Resiliscore Assessment</h2>
        <p className="af-assessmentSub">
          Score each statement from <strong>0 to 5</strong>. All questions must be answered before results can be generated.
        </p>

        <div className="af-progressPanel">
          <div className="af-progressTop">
            <div className="af-progressText">
              Progress: <strong>{answeredCount}</strong> / {total} answered
            </div>
            <div className="af-progressPct">{pct}%</div>
          </div>

          <div className="af-progressBar">
            <div className="af-progressFill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <details className="af-helpPanel">
          <summary>How to use the 0–5 scale</summary>
          <div className="af-scaleGrid">
            {SCALE_UI.map((s) => (
              <div key={s.v} className="af-scaleItem">
                <div className="af-scaleNum">{s.label}</div>
                <div className="af-scaleHint">{s.hint}</div>
              </div>
            ))}
          </div>
        </details>

        {submitError ? <div className="af-submitError">{submitError}</div> : null}
      </section>

      <section className="af-domainStack">
        {grouped.map((g) => (
          <div key={g.code} className="af-domainSection">
            <div className="af-domainHeader">
              <div className="af-domainTitleRow">
                <div className="af-domainIcon">
                  <DomainIcon />
                </div>
                <div>
                  <div className="af-domainTitle">{g.name}</div>
                  <div className="af-domainSub">Answer based on what is true in practice today.</div>
                </div>
              </div>

              <div className="af-domainCount">
                {g.items.filter((q) => answers[q.id]?.score !== null).length} / {g.items.length}
              </div>
            </div>

            <div className="af-questionList">
              {g.items.map((q, idx) => {
                const a = answers[q.id] ?? { score: null };
                const num = idx + 1;
                const isMissing = unansweredIds.has(q.id);

                return (
                  <div
                    key={q.id}
                    id={`question-${q.id}`}
                    className={`af-questionCard ${isMissing ? "af-questionCardMissing" : ""}`}
                  >
                    <div className="af-questionTop">
                      <div className="af-questionNo">Q{num}</div>
                      <div className="af-questionText">{q.text}</div>
                    </div>

                    {q.help_text ? (
                      <details className="af-questionHelp">
                        <summary>Help</summary>
                        <div className="af-questionHelpText">{q.help_text}</div>
                      </details>
                    ) : null}

                    <div className="af-scaleButtons">
                      {SCALE_UI.map((s) => {
                        const active = a.score === s.v;

                        return (
                          <button
                            key={s.v}
                            type="button"
                            className={`af-scoreBtn ${active ? "active" : ""}`}
                            onClick={() => {
                              setAnswers((prev) => ({
                                ...prev,
                                [q.id]: { ...prev[q.id], score: s.v },
                              }));

                              if (unansweredIds.has(q.id)) {
                                setUnansweredIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(q.id);
                                  return next;
                                });
                              }
                            }}
                          >
                            <span className="af-scoreBtnNum">{s.label}</span>
                            <span className="af-scoreBtnHint">{s.hint}</span>
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

      <div className="af-stickyBar">
        <div className="af-stickyInner">
          <div className="af-stickyMeta">
            <div className="af-stickyCount">
              Answered <strong>{answeredCount}</strong> / {total}
            </div>
            <div className="af-stickyPct">{pct}% complete</div>
          </div>

          <button className="af-btn af-btnPrimary" disabled={submitting} onClick={submit}>
            {submitting ? "Submitting…" : "Submit & View Results"}
          </button>
        </div>
      </div>

      <style>{`
        .af-shell {
          padding-bottom: 96px;
          display: grid;
          gap: 18px;
        }

        .af-assessmentHero {
          border-radius: 24px;
          padding: 22px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 10px 28px rgba(3,16,22,0.08);
        }

        .af-assessmentKicker {
          color: #0a8d62;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .af-assessmentTitle {
          margin: 8px 0 0;
          color: #061b22;
          font-size: 32px;
          line-height: 1.08;
        }

        .af-assessmentSub {
          margin: 12px 0 0;
          color: rgba(6,27,34,0.72);
          line-height: 1.7;
          max-width: 76ch;
        }

        .af-progressPanel {
          margin-top: 18px;
          border-radius: 18px;
          padding: 16px;
          background: #f8fbfb;
          border: 1px solid rgba(6,27,34,0.08);
        }

        .af-progressTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 10px;
        }

        .af-progressText,
        .af-progressPct {
          color: rgba(6,27,34,0.72);
        }

        .af-progressBar {
          height: 12px;
          border-radius: 999px;
          background: rgba(6,27,34,0.06);
          overflow: hidden;
        }

        .af-progressFill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #0db17b, #4fd8a9);
        }

        .af-helpPanel {
          margin-top: 16px;
          border-top: 1px solid rgba(6,27,34,0.08);
          padding-top: 14px;
        }

        .af-helpPanel summary {
          cursor: pointer;
          color: #061b22;
          font-weight: 700;
        }

        .af-scaleGrid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .af-scaleItem {
          border-radius: 14px;
          padding: 12px;
          background: #f8fbfb;
          border: 1px solid rgba(6,27,34,0.08);
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .af-scaleNum {
          width: 34px;
          height: 28px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: rgba(13,177,123,0.10);
          color: #0a8d62;
          font-weight: 900;
          flex: 0 0 auto;
        }

        .af-scaleHint {
          color: rgba(6,27,34,0.72);
          font-size: 14px;
        }

        .af-submitError {
          margin-top: 14px;
          border-radius: 14px;
          padding: 12px 14px;
          background: rgba(255,107,107,0.10);
          border: 1px solid rgba(255,107,107,0.22);
          color: #b84242;
          font-weight: 700;
        }

        .af-domainStack {
          display: grid;
          gap: 18px;
        }

        .af-domainSection {
          border-radius: 24px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(6,27,34,0.08);
          box-shadow: 0 10px 28px rgba(3,16,22,0.08);
        }

        .af-domainHeader {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(6,27,34,0.08);
        }

        .af-domainTitleRow {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .af-domainIcon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(13,177,123,0.10);
          color: #0a8d62;
          flex: 0 0 auto;
        }

        .af-domainTitle {
          color: #061b22;
          font-size: 19px;
          font-weight: 850;
        }

        .af-domainSub {
          margin-top: 4px;
          color: rgba(6,27,34,0.62);
          font-size: 14px;
        }

        .af-domainCount {
          min-width: 66px;
          height: 36px;
          padding: 0 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(13,177,123,0.10);
          color: #0a8d62;
          font-weight: 850;
          font-size: 14px;
        }

        .af-questionList {
          margin-top: 16px;
          display: grid;
          gap: 14px;
        }

        .af-questionCard {
          border-radius: 20px;
          padding: 18px;
          background: #fbfcfd;
          border: 1px solid rgba(6,27,34,0.08);
          transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }

        .af-questionCard:hover {
          border-color: rgba(13,177,123,0.16);
          box-shadow: 0 12px 26px rgba(3,16,22,0.06);
        }

        .af-questionCardMissing {
          border-color: rgba(255,107,107,0.28);
          box-shadow: 0 0 0 3px rgba(255,107,107,0.08);
        }

        .af-questionTop {
          display: grid;
          grid-template-columns: 58px 1fr;
          gap: 14px;
          align-items: start;
        }

        .af-questionNo {
          color: rgba(6,27,34,0.56);
          font-size: 13px;
          padding-top: 2px;
          font-weight: 700;
        }

        .af-questionText {
          color: #061b22;
          font-weight: 700;
          line-height: 1.5;
        }

        .af-questionHelp {
          margin-top: 12px;
        }

        .af-questionHelp summary {
          cursor: pointer;
          color: rgba(6,27,34,0.62);
          font-weight: 600;
        }

        .af-questionHelpText {
          margin-top: 10px;
          color: rgba(6,27,34,0.72);
          line-height: 1.65;
        }

        .af-scaleButtons {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }

        .af-scoreBtn {
          text-align: left;
          border-radius: 14px;
          padding: 12px;
          border: 1px solid rgba(6,27,34,0.10);
          background: #ffffff;
          color: #061b22;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
        }

        .af-scoreBtn:hover {
          transform: translateY(-1px);
          border-color: rgba(13,177,123,0.22);
          box-shadow: 0 10px 20px rgba(3,16,22,0.06);
        }

        .af-scoreBtn.active {
          border-color: rgba(13,177,123,0.36);
          background: rgba(13,177,123,0.10);
          box-shadow: 0 0 0 3px rgba(13,177,123,0.08);
        }

        .af-scoreBtnNum {
          display: block;
          color: #0a8d62;
          font-weight: 900;
          font-size: 18px;
          line-height: 1;
        }

        .af-scoreBtnHint {
          display: block;
          margin-top: 8px;
          color: rgba(6,27,34,0.66);
          font-size: 12px;
          line-height: 1.4;
        }

        .af-stickyBar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 60;
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,0.10);
          background: rgba(6,27,34,0.92);
          backdrop-filter: blur(10px);
        }

        .af-stickyInner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .af-stickyMeta {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .af-stickyCount,
        .af-stickyPct {
          color: rgba(255,255,255,0.78);
        }

        .af-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.18s ease, background 0.18s ease;
        }

        .af-btn:hover {
          transform: translateY(-1px);
        }

        .af-btnPrimary {
          background: #0db17b;
          color: #fff;
          box-shadow: 0 8px 20px rgba(13,177,123,0.22);
        }

        .af-btnPrimary:hover {
          background: #0a8d62;
        }

        .af-btnPrimary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 980px) {
          .af-scaleButtons {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 700px) {
          .af-assessmentHero,
          .af-domainSection {
            padding: 16px;
          }

          .af-assessmentTitle {
            font-size: 28px;
          }

          .af-scaleGrid,
          .af-scaleButtons {
            grid-template-columns: 1fr 1fr;
          }

          .af-questionTop {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .af-domainHeader,
          .af-stickyInner {
            flex-direction: column;
            align-items: flex-start;
          }

          .af-stickyInner {
            padding: 0 12px;
          }
        }
      `}</style>
    </div>
  );
}