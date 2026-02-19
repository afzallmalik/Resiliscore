import { NextResponse } from "next/server";
import { loadQuestionSet } from "@/lib/questions";

export async function GET() {
  const data = loadQuestionSet();
  return NextResponse.json(data);
}
