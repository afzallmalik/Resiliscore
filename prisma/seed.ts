import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type QuestionRow = {
  modelVersion: string;
  domain: string;
  order: number;
  prompt: string;
  helpText: string;
  mapping?: any;
};

async function main() {
  const filePath = path.join(process.cwd(), "prisma", "seed-data", "questions.v3_1.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const questions = JSON.parse(raw) as QuestionRow[];

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("questions.v3_1.json is empty or invalid");
  }

  // All rows should share the same modelVersion
  const modelVersion = questions[0]?.modelVersion ?? "v3.1";

  // 1) Remove existing questions for this modelVersion (clean replace)
  await prisma.question.deleteMany({ where: { modelVersion } });

  // 2) Insert
  await prisma.question.createMany({
    data: questions.map((q) => ({
      modelVersion: q.modelVersion,
      domain: q.domain,
      order: q.order,
      prompt: q.prompt,
      helpText: q.helpText,
      mapping: q.mapping ?? null,
    })),
  });

  console.log(`✅ Seeded ${questions.length} questions for modelVersion=${modelVersion}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });