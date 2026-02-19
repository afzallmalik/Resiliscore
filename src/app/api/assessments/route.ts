import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const assessment = await prisma.assessment.create({ data: {} });
  return NextResponse.json({ id: assessment.id }, { status: 201 });
}
