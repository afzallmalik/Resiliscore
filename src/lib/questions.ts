import fs from "node:fs";
import path from "node:path";

export type ResiliscoreDomain = { code: string; name: string; order: number };
export type ResiliscoreQuestion = {
  id: string;
  domain_code: string;
  domain_name: string;
  domain_order: number;
  question_number: number;
  text: string;
  help_text?: string;
  active: boolean;
  mapping?: {
    nist?: string[];
    iso27001_2022?: string[];
    uk_cyber_bill?: string[];
  };
};

export function loadQuestionSet() {
  const p = path.join(process.cwd(), "data", "questions.v1.json");
  const raw = fs.readFileSync(p, "utf-8");
  const json = JSON.parse(raw);
  const domains: ResiliscoreDomain[] = json.domains;
  const questions: ResiliscoreQuestion[] = (json.questions ?? []).filter((q: ResiliscoreQuestion) => q.active);
  return { domains, questions };
}
