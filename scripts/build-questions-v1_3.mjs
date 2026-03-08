import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const IN_DIR = path.join(ROOT, "prisma", "seed-data");

const V1_1 = path.join(IN_DIR, "questions.v1_1.json");
const V1_2 = path.join(IN_DIR, "questions.additions.v1_2.json");
const OUT = path.join(IN_DIR, "questions.v1_3.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * Normalise shapes:
 * v1.1 uses: { modelVersion, domain, order, prompt, helpText }
 * v1.2 uses: { domain, prompt, helpText } (no order / modelVersion)
 */
function normalise(list, defaultModelVersion) {
  const out = [];
  for (const x of list) {
    const domain = String(x.domain ?? "").trim();
    const prompt = String(x.prompt ?? "").trim();
    const helpText = String(x.helpText ?? "").trim();

    if (!domain || !prompt) continue;

    out.push({
      modelVersion: String(x.modelVersion ?? defaultModelVersion),
      domain,
      order: Number.isFinite(Number(x.order)) ? Number(x.order) : null,
      prompt,
      helpText,
    });
  }
  return out;
}

const v11Raw = readJson(V1_1);
const v12Raw = readJson(V1_2);

const v11 = normalise(v11Raw, "v1.1"); // keep their info, we'll rewrite to v1.3 later
const v12 = normalise(v12Raw, "v1.2");

// Merge then re-number per domain cleanly for v1.3
const merged = [...v11, ...v12];

// Group by domain
const byDomain = new Map();
for (const q of merged) {
  if (!byDomain.has(q.domain)) byDomain.set(q.domain, []);
  byDomain.get(q.domain).push(q);
}

// Sort domains A→Z (stable output)
const domainsSorted = Array.from(byDomain.keys()).sort((a, b) => a.localeCompare(b));

// Build final v1.3 list with sequential order per domain
const final = [];
for (const domain of domainsSorted) {
  const items = byDomain.get(domain);

  // Sort: existing order first, then prompt text as fallback
  items.sort((a, b) => {
    const ao = a.order ?? 999999;
    const bo = b.order ?? 999999;
    if (ao !== bo) return ao - bo;
    return a.prompt.localeCompare(b.prompt);
  });

  // Remove exact duplicates within domain (prompt match)
  const seen = new Set();
  const deduped = [];
  for (const it of items) {
    const k = it.prompt.toLowerCase().trim();
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(it);
  }

  deduped.forEach((it, idx) => {
    final.push({
      modelVersion: "v1.3",
      domain,
      order: idx + 1,
      prompt: it.prompt,
      helpText: it.helpText ?? "",
    });
  });
}

fs.writeFileSync(OUT, JSON.stringify(final, null, 2), "utf8");
console.log(`✅ Built v1.3 questions: ${final.length} rows`);
console.log(`→ ${OUT}`);