import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";

const schema = z.object({
  nombre:  z.string().trim().min(1).max(100),
  email:   z.string().email(),
  asunto:  z.string().trim().max(200).optional(),
  mensaje: z.string().trim().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const d = parsed.data;
  await prisma.contactMessage.create({
    data: {
      nombre:  d.nombre,
      email:   d.email,
      asunto:  d.asunto ?? null,
      mensaje: d.mensaje,
    },
  });

  return NextResponse.json({ ok: true });
}
