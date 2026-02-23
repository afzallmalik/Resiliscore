import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Set your versions here
const FROM_VERSION = "v1.1";
const TO_VERSION = "v1.2";

// ✅ Load additions JSON
const additionsPath = path.join(process.cwd(), "prisma", "seed-data", "questions.additions.v1_2.json");
const additions = JSON.parse(fs.readFileSync(additionsPath, "utf8"));

/**
 * Domain mapping: your DB domain names must match exactly.
 * If your Prisma Studio uses slightly different names, edit the right-hand side.
 */
const DOMAIN_MAP = {
  "Governance": "Governance",
  "Risk Management": "Risk Management",
  "Asset & Data": "Asset & Data",
  "Identity & Access": "Identity & Access",
  "Secure Operations": "Secure Operations",
  "Vulnerability & Change": "Vulnerability & Change",
  "Supplier & Third-Party": "Supplier & Third-Party",
  "Incident Response": "Incident Response",
  "Continuity & Recovery": "Continuity & Recovery",
  "People & Culture": "People & Culture"
};

function mapDomain(d) {
  return DOMAIN_MAP[d] ?? d;
}

async function main() {
  console.log(`Creating ${TO_VERSION} from ${FROM_VERSION}...`);

  // 1) Read existing FROM_VERSION questions
  const base = await prisma.question.findMany({
    where: { modelVersion: FROM_VERSION },
    orderBy: [{ domain: "asc" }, { order: "asc" }],
  });

  if (!base.length) {
    throw new Error(`No questions found for ${FROM_VERSION}. Check Prisma Studio / DB.`);
  }

  // 2) If TO_VERSION already exists, stop (safe)
  const existingTo = await prisma.question.count({ where: { modelVersion: TO_VERSION } });
  if (existingTo > 0) {
    throw new Error(`${TO_VERSION} already exists with ${existingTo} questions. Delete it first if you want to recreate.`);
  }

  // 3) Clone v1.1 into v1.2 with same domain/order
  console.log(`Cloning ${base.length} questions into ${TO_VERSION}...`);
  for (const q of base) {
    await prisma.question.create({
      data: {
        domain: q.domain,
        order: q.order,
        prompt: q.prompt,
        helpText: q.helpText,
        modelVersion: TO_VERSION,
      },
    });
  }

  // 4) Build current max order per domain in v1.2
  const maxOrderByDomain = new Map();
  const v12 = await prisma.question.findMany({
    where: { modelVersion: TO_VERSION },
    select: { domain: true, order: true },
  });
  for (const q of v12) {
    const cur = maxOrderByDomain.get(q.domain) ?? 0;
    if (q.order > cur) maxOrderByDomain.set(q.domain, q.order);
  }

  // 5) Append additions using next order per domain
  console.log(`Adding ${additions.length} new questions to ${TO_VERSION}...`);

  for (const a of additions) {
    const domain = mapDomain(a.domain);

    const nextOrder = (maxOrderByDomain.get(domain) ?? 0) + 1;
    maxOrderByDomain.set(domain, nextOrder);

    await prisma.question.create({
      data: {
        domain,
        order: nextOrder,
        prompt: a.prompt,
        helpText: a.helpText,
        modelVersion: TO_VERSION,
      },
    });
  }

  const finalCount = await prisma.question.count({ where: { modelVersion: TO_VERSION } });
  console.log(`✅ Done. ${TO_VERSION} now has ${finalCount} questions.`);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });