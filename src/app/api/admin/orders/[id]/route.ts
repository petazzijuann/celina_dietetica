import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma/client";
import { fulfillOrder, releaseStock } from "@/lib/orders/fulfill";

const updateSchema = z.object({
  status:            z.string().optional(),
  payment_proof_url: z.string().url().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params;
  const body    = await request.json().catch(() => null);
  const parsed  = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const d = parsed.data;

  if (d.status === "payment_confirmed") {
    const order = await prisma.order.findUnique({ where: { id } });
    if (order) await fulfillOrder(id, order.payment_method);
  }

  if (d.status === "cancelled") {
    await releaseStock(id);
    return NextResponse.json({ ok: true });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(d.status            ? { status:            d.status }            : {}),
        ...(d.payment_proof_url !== undefined ? { payment_proof_url: d.payment_proof_url } : {}),
      },
    });
    return NextResponse.json({ id: order.id, status: order.status });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
