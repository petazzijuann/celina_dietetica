import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  const subs = await prisma.subscriber.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json(
    subs.map((s) => ({
      id:         s.id,
      email:      s.email,
      created_at: s.created_at.toISOString(),
    }))
  );
}
